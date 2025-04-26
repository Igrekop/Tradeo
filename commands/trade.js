const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

// 🔧 Nettoyage du nom du skin
function normalizeSkinName(name) {
    const wearMap = {
        'fn': 'Factory New',
        'mw': 'Minimal Wear',
        'ft': 'Field-Tested',
        'bs': 'Battle-Scarred',
        'ww': 'Well-Worn',
        'factorynew': 'Factory New',
        'minimalwear': 'Minimal Wear',
        'fieldtested': 'Field-Tested',
        'battlescarred': 'Battle-Scarred',
        'wellworn': 'Well-Worn',
        'factory-new': 'Factory New',
        'minimal-wear': 'Minimal Wear',
        'field-tested': 'Field-Tested',
        'battle-scarred': 'Battle-Scarred',
        'well-worn': 'Well-Worn',
    };

    if (/knife|dagger|bayonet|karambit|m9|talon|shadow|butterfly|huntsman|falchion|bowie|paracord|stiletto|ursus|navaja|classic|skeleton/i.test(name) && !name.startsWith('★')) {
        name = `★ ${name}`;
    }

    return name
        .replace(/\((fn|mw|ft|bs|ww|factorynew|minimalwear|fieldtested|battlescarred|wellworn|factory-new|minimal-wear|field-tested|battle-scarred|well-worn)\)/i, (_, short) => `(${wearMap[short.toLowerCase()]})`)
        .replace(/\b(factory new|minimal wear|field-tested|battle-scarred|well-worn)\b/gi, match =>
            match
                .toLowerCase()
                .replace(/\./g, '')
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('-')
                .replace(/\b\w/g, c => c.toUpperCase())
        );
}

// 📦 Récupération de l'image depuis Steam
async function getSteamSkinMeta(skinName) {
    const cleanName = normalizeSkinName(skinName);
    const encodedName = encodeURIComponent(cleanName);
    const url = `https://steamcommunity.com/market/listings/730/${encodedName}`;

    try {
        const res = await fetch(url);
        const html = await res.text();

        const imageMatch = html.match(/"icon_url":"([^"]+)"/);
        const imageUrl = imageMatch
            ? `https://steamcommunity-a.akamaihd.net/economy/image/${imageMatch[1]}/300fx300`
            : null;

        return { imageUrl };
    } catch (err) {
        console.error('Steam Meta Error:', err);
        return { imageUrl: null };
    }
}

// 📈 Récupération du prix sur Skin.Broker
async function fetchSkinData(skinName) {
    const apiKey = 'sbv1YPCCBXtfQ14TeyepeZqMAmcyfIxXiDHDSr7zmJAwAUBE2Q5P';
    const normalizedSkinName = normalizeSkinName(skinName);
    const apiUrl = `https://skin.broker/api/v1/item?marketHashName=${encodeURIComponent(normalizedSkinName)}&key=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.success) {
            console.error(`No data found for the skin "${skinName}".`);
            return null;
        }

        const { imageUrl } = await getSteamSkinMeta(normalizedSkinName);

        if (!imageUrl) {
            console.error(`No image found for the skin "${skinName}".`);
            return null;
        }

        const buffPrice = data.price.buff.converted.price;
        const buffCurrency = data.price.buff.converted.currency;

        return {
            name: data.name,
            price: buffPrice,
            currency: buffCurrency,
            image: imageUrl,
        };

    } catch (error) {
        console.error('Error fetching skin data:', error);
        return null;
    }
}

// 🎯 Commande principale $trade
module.exports = {
    name: 'trade',
    description: 'Simulate a trade between items and show profit or loss.',
    async execute(message) {
        const args = message.content.split(' ').slice(1).join(' ').split('for');
        if (args.length !== 2) {
            return message.reply('Please use the correct format: `$trade item1 ; item2 for item3 ; item4`');
        }

        const givePart = args[0].trim();
        const receivePart = args[1].trim();

        const giveItems = givePart.split(';').map(item => item.trim()).filter(item => item.length > 0);
        const receiveItems = receivePart.split(';').map(item => item.trim()).filter(item => item.length > 0);

        if (giveItems.length === 0 || receiveItems.length === 0) {
            return message.reply('Please specify at least one item on each side of the trade.');
        }

        let totalGive = 0;
        let totalReceive = 0;
        const giveDataList = [];
        const receiveDataList = [];

        try {
            // 📥 Fetch pour chaque item donné
            for (const item of giveItems) {
                const data = await fetchSkinData(item);
                if (!data) continue;
                totalGive += data.price;
                giveDataList.push(data);
            }

            // 📤 Fetch pour chaque item reçu
            for (const item of receiveItems) {
                const data = await fetchSkinData(item);
                if (!data) continue;
                totalReceive += data.price;
                receiveDataList.push(data);
            }

            if (giveDataList.length === 0 || receiveDataList.length === 0) {
                return message.reply('Could not retrieve data for the items. Check the names and try again.');
            }

            // 📊 Calcul du profit
            const profit = totalReceive - totalGive;
            const profitPercent = (profit / totalGive) * 100;

            const embed = new EmbedBuilder()
                .setTitle('Trade Simulation')
                .setColor(profit >= 0 ? 0x00FF00 : 0xFF0000)
                .setDescription(`**Profit:** ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} (${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%)`)
                .setFooter({
                    text: 'Main Dev : igrek_zaide',
                    iconURL: 'https://i.imghippo.com/files/Mb7151RSU.jpg'
                  })
                .setTimestamp();

            // Ajoute les items donnés
            embed.addFields({ name: 'You Give:', value: giveDataList.map(d => `[${d.name}](https://steamcommunity.com/market/listings/730/${encodeURIComponent(d.name)})\n💵 $${d.price.toFixed(2)}`).join('\n'), inline: true });

            // Ajoute les items reçus
            embed.addFields({ name: 'You Receive:', value: receiveDataList.map(d => `[${d.name}](https://steamcommunity.com/market/listings/730/${encodeURIComponent(d.name)})\n💵 $${d.price.toFixed(2)}`).join('\n'), inline: true });

            // Met une thumbnail (premier skin reçu)
            embed.setThumbnail(receiveDataList[0].image);

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error during trade simulation:', error);
            message.reply('An error occurred while simulating the trade. Please try again later.');
        }
    },
};