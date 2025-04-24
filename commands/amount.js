const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Chart = require('chart.js/auto');
require('chartjs-plugin-datalabels');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 600;
const height = 400;
const chartCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: '#1e1e1e',
});

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

    return name
        .replace(/\((fn|mw|ft|bs|ww|factorynew|minimalwear|fieldtested|battlescarred|wellworn|factory-new|minimal-wear|field-tested|battle-scarred|well-worn)\)/i, (_, short) => `(${wearMap[short.toLowerCase()]})`)
        .replace(/\b(factory new|minimal wear|field-tested|battle-scarred|well-worn)\b/gi, match =>
            match
                .toLowerCase()
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('-')
                .replace(/\b\w/g, c => c.toUpperCase())
        );
}

// 📦 Récupération image depuis la page Steam
async function getSteamSkinMeta(skinName) {
    const cleanName = normalizeSkinName(skinName);
    const encodedName = encodeURIComponent(cleanName);
    const url = `https://steamcommunity.com/market/listings/730/${encodedName}`;

    try {
        const res = await fetch(url);
        const html = await res.text();

        // 🔎 Image
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

module.exports = {
    name: 'amount',
    description: 'Shows item availability with a chart from the last 7 days.',
    async execute(message) {
        const args = message.content.split(' ').slice(1);
        const skinName = args.join(' ');

        if (!skinName) {
            return message.reply('Please specify a skin name. Example: `$amount AWP | Medusa (BS)`');
        }

        const cleanName = normalizeSkinName(skinName);
        const encodedSkin = encodeURIComponent(cleanName);
        const apiKey = 'sbv1YPCCBXtfQ14TeyepeZqMAmcyfIxXiDHDSr7zmJAwAUBE2Q5P';
        const url = `https://skin.broker/api/v1/item/volume?marketHashName=${encodedSkin}&key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!data || Object.keys(data).length === 0) {
                return message.reply('No data found for this skin.');
            }

            const platforms = Object.keys(data);
            const values = Object.values(data);

            const chartConfig = {
                type: 'bar',
                data: {
                    labels: platforms,
                    datasets: [{
                        label: 'Available Items',
                        data: values,
                        backgroundColor: [
                            '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
                            '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab',
                        ],
                        borderWidth: 1,
                    }],
                },
                options: {
                    responsive: false,
                    scales: {
                        x: {
                            ticks: {
                                color: '#ffffff',
                                font: { size: 14, weight: 'bold' },
                                padding: 20,
                            },
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#ffffff',
                                font: { size: 12 },
                                precision: 0,
                            },
                        },
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: `Availability for "${skinName}"`,
                            color: '#ffffff',
                            font: { size: 20 },
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'start',
                            color: '#ffffff',
                            font: { weight: 'bold', size: 12 },
                            formatter: Math.round,
                        },
                    },
                },
                plugins: [require('chartjs-plugin-datalabels')],
            };

            const chartBuffer = await chartCanvas.renderToBuffer(chartConfig);
            const attachment = new AttachmentBuilder(chartBuffer, { name: 'chart.png' });

            const { imageUrl } = await getSteamSkinMeta(skinName);

            // Vérifiez si l'image existe
            if (!imageUrl) {
                return message.reply(`No image found for the skin \`"${skinName}"\`. Please check the name and try again.`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`"${cleanName}" - Marketplace Quantities`)
                .setDescription(`Request made by ${message.author}`)
                .setAuthor({ name: 'Tradeo' })
                .setColor('#FF8C00')
                .setFields([
                    { name: 'Note', value: 'The graph is a rough estimate and may not be 100% accurate.' },
                ])
                .setImage('attachment://chart.png')
                .setThumbnail(imageUrl)
                .setTimestamp()
                .setFooter({ text: 'Main Dev : igrek_zaide', iconURL: 'https://i.imghippo.com/files/Mb7151RSU.jpg' });

            message.channel.send({ embeds: [embed], files: [attachment] });

        } catch (err) {
            console.error(err);
            message.reply('Error while fetching or displaying data.');
        }
    },
};