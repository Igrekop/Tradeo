const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const axios = require('axios');

// 🔠 Capitalise les mots
function capitalizeWords(str) {
    return str
        .toLowerCase()
        .replace(/\./g, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

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

    // 🛠️ Uniformise le wear
    name = name.replace(
        /\((fn|mw|ft|bs|ww|factorynew|minimalwear|fieldtested|battlescarred|wellworn|factory-new|minimal-wear|field-tested|battle-scarred|well-worn)\)/i,
        (_, short) => `(${wearMap[short.toLowerCase()]})`
    );

    // ✅ Remplacer "StatTrak" par "StatTrak™" uniquement si pas déjà "™"
    name = name.replace(/\bStatTrak(?!™)/i, 'StatTrak™');

    // ✅ Ajouter "★" pour couteaux/gants s'il n'y est pas déjà
    if (/knife|dagger|bayonet|karambit|m9|talon|shadow|butterfly|huntsman|falchion|bowie|paracord|stiletto|ursus|navaja|classic|skeleton|gloves|hand wrap/i.test(name)
        && !name.startsWith('★')) {
        name = `★ ${name}`;
    }

    return name;
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

// 📁 Emojis des plateformes
const siteEmojis = {
    buff: { id: '1365003160443162745', name: 'buff' },
    skinport: { id: '1365003180810829974', name: 'skinport' },
    marketCsgo: { id: '1365003529303097374', name: 'marketcsgo' },
    gamerpay: { id: '1365004880263254028', name: 'gamerpay' },
    csfloat: { id: '1365003200876380250', name: 'csfloat' },
    skinwallet: { id: '1365004931886481602', name: 'skinwallet' },
    waxpeer: { id: '1365004970449047622', name: 'waxpeer' },
    bitskins: { id: '1365003244329373717', name: 'bitskins' },
    lootfarm: { id: '1365005003160424561', name: 'lootfarm' },
    skinbaron: { id: '1365003223999447070', name: 'skinbaron' },
    skinflow: { id: '1365005071686828194', name: 'skinflow' },
    tradeit: { id: '1365005139827494954', name: 'tradeit' },
    steam: { id: '1365003268471914577', name: 'steam' },
    csmoney: { id: '1365003295579574373', name: 'csmoney' },
    dmarket: { id: '1365005172580810823', name: 'dmarket' },
    csdeals: { id: '1365005238951608321', name: 'cs' },
    shadowpay: { id: '1365005313471676478', name: 'shadowpay' },
    swapgg: { id: '1365005347621961870', name: 'swap' },
    lootbear: { id: '1365005373718794301', name: 'lootbear' },
    cstrade: { id: '1365005435417002066', name: 'cstrade' },
    skinthunder: { id: '1365005496901173299', name: 'skinthunder' },
    lisSkins: { id: '1365005525560987813', name: 'lisskins' },
    skinsmonkey: { id: '1365005581336707182', name: 'skinsmonkey' },
    skinout: { id: '1365013988580003860', name: 'skinout' },
    rapidskins: { id: '1365005604489400452', name: 'rapidskins' },
    c5game: { id: '1365005644356255916', name: 'c5game' },
    manncostore: { id: '1365014226803888151', name: 'mancostore' },
    csgo500: { id: '1365005682050597105', name: 'csgo500' },
    skinswap: { id: '1365005706440212490', name: 'skinswap' },
    buffBuyOrder: { id: '1365003160443162745', name: 'buff' },
    skinvault: { id: '1365005730628767764', name: 'skinvault' },
    haloskins: { id: '1365005751508144372', name: 'haloskins' },
    csgoempire: { id: '1365005772987175012', name: 'csgoempire' },
    krakatoa: { id: '1365005791844765746', name: 'krakatoa' },
    clashgg: { id: '1365003313711550544', name: 'clash' },
    whitemarket: { id: '1365005810933039145', name: 'whitemarket' },
    csmoneyTrade: { id: '1365003295579574373', name: 'csmoney' },
    skinbid: { id: '1365003511401808134', name: 'skinbid' },
    privateskins: { id: '1365005833615704195', name: 'privateskins' },
    itrade: { id: '1365005853077536859', name: 'itrade' },
    avanmarket: { id: '1365005874866946138', name: 'avanmarket' },
};

module.exports = {
    name: 'price',
    description: 'Get the price of a skin and compare it across different platforms.',
    async execute(message) {
        const args = message.content.split(' ').slice(1);
        let quantity = 1;
        let rawSkinName = args.join(' ');

        const match = rawSkinName.match(/x(\d+)$/i);
        if (match) {
            quantity = Math.min(parseInt(match[1]), 1000); // max sécurité
            rawSkinName = rawSkinName.replace(/x\d+$/i, '').trim();
        }

        if (!rawSkinName) {
            return message.reply('Please specify a skin name. Example: `$price AWP | Medusa (Battle-Scarred)`');
        }

        const skinName = normalizeSkinName(rawSkinName);

        const apiKey = 'sbv1YPCCBXtfQ14TeyepeZqMAmcyfIxXiDHDSr7zmJAwAUBE2Q5P';
        const apiUrl = `https://skin.broker/api/v1/item?marketHashName=${encodeURIComponent(skinName)}&key=${apiKey}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data.success) {
                return message.reply(`No data found for the skin "${skinName}". Please check the name and try again.`);
            }

            const { imageUrl } = await getSteamSkinMeta(skinName);

            if (!imageUrl) {
                return message.reply(`No image found for the skin "${skinName}".`);
            }

            const buffPrice = data.price.buff.converted.price;
            const buffCurrency = data.price.buff.converted.currency;
            const buffCount = data.price.buff.count;

            const embed = new EmbedBuilder()
                .setTitle(`Price for "${data.name}"`)
                .setDescription(`Here is the price information for **${data.name}** (x${quantity}).`)
                .setThumbnail(imageUrl)
                .setColor('Blue')
                .addFields(
                    { name: `Buff Price (x${quantity})`, value: `${(buffPrice * quantity).toFixed(2)} ${buffCurrency}`, inline: true },
                    { name: 'Available on Buff', value: `${buffCount} listings`, inline: true }
                )
                .setFooter({ text: 'Main Dev : igrek_zaide', iconURL: 'https://i.imghippo.com/files/Mb7151RSU.jpg' })
                .setTimestamp();

            const options = [];

            options.push({
                label: `Buff - ${(buffPrice * quantity).toFixed(2)} ${buffCurrency}`,
                description: `${buffCount} listings | Reference price`,
                value: 'buff',
                emoji: siteEmojis.buff
            });

            for (const [site, siteData] of Object.entries(data.price)) {
                const cleanedSite = site.replace(/\./g, '');

                if (cleanedSite !== 'buff' && siteData.converted.price > 0) {
                    const price = siteData.converted.price;
                    const currency = siteData.converted.currency;
                    const count = siteData.count;
                    const totalPrice = price * quantity;
                    const diff = (((totalPrice - buffPrice * quantity) / (buffPrice * quantity)) * 100).toFixed(2);

                    options.push({
                        label: `${capitalizeWords(cleanedSite)} - ${totalPrice.toFixed(2)} ${currency}`,
                        description: `${count} listings | ${diff}% ${diff < 0 ? 'cheaper' : 'more expensive'}`,
                        value: cleanedSite,
                        emoji: siteEmojis[cleanedSite]?.id || undefined
                    });
                }
            }

            options.sort((a, b) => {
                const priceA = parseFloat(a.label.split(' - ')[1].split(' ')[0]);
                const priceB = parseFloat(b.label.split(' - ')[1].split(' ')[0]);
                return priceA - priceB;
            });

            const limitedOptions = options.slice(0, 25);

            if (limitedOptions.length === 0) {
                return message.reply('No other platforms have price data for this skin.');
            }

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('price_comparison')
                    .setPlaceholder('Select a platform to compare prices')
                    .addOptions(limitedOptions)
            );

            await message.reply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error(error);
            message.reply('An error occurred while fetching the price data. Please try again later.');
        }
    },
};
