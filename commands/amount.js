const { EmbedBuilder } = require('discord.js');

function normalizeSkinName(name) {
  const wearMap = {
    fn: 'Factory New', mw: 'Minimal Wear', ft: 'Field-Tested',
    bs: 'Battle-Scarred', ww: 'Well-Worn',
  };

  // Ajouter l'étoile pour les couteaux si elle est absente
  if (/knife|dagger|bayonet|karambit|m9|talon|shadow|butterfly|huntsman|falchion|bowie|paracord|stiletto|ursus|navaja|classic|skeleton/i.test(name) && !name.startsWith('★')) {
    name = `★ ${name}`;
  }

  return name.replace(/\b(fn|mw|ft|bs|ww)\b/gi, m => wearMap[m.toLowerCase()] || m);
}

async function getSteamSkinMeta(skinName) {
  const cleanName = normalizeSkinName(skinName);
  const url = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(cleanName)}`;
  try {
    const res = await fetch(url);
    const html = await res.text();
    const match = html.match(/"icon_url":"([^"]+)"/);
    return {
      imageUrl: match
        ? `https://steamcommunity-a.akamaihd.net/economy/image/${match[1]}/300fx300`
        : null
    };
  } catch {
    return { imageUrl: null };
  }
}

module.exports = {
  name: 'amount',
  description: 'Shows item availability with a chart from the last 7 days.',
  async execute(message) {
    const args = message.content.split(' ').slice(1);
    const skinName = args.join(' ');
    if (!skinName)
      return message.reply('Please specify a skin name. Example: `$amount AWP | Medusa (BS)`');

    const cleanName = normalizeSkinName(skinName);
    const encodedSkin = encodeURIComponent(cleanName);
    const apiKey = 'sbv1YPCCBXtfQ14TeyepeZqMAmcyfIxXiDHDSr7zmJAwAUBE2Q5P';
    const url = `https://skin.broker/api/v1/item/volume?marketHashName=${encodedSkin}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data || !Object.keys(data).length)
        return message.reply('No data found for this skin.');

      const labels = Object.keys(data);
      const values = Object.values(data);

      const qcConfig = {
        type: 'bar',
        data: { labels, datasets: [{
          label: 'Available Items',
          data: values,
          backgroundColor: 'rgba(0, 234, 255, 0.7)'
        }]},
        options: {
          plugins: {
            title: {
              display: true,
              text: `Availability for "${cleanName}"`,
              color: '#fff',
              font: { size: 20 }
            },
            legend: { display: false },
            datalabels: {
              display: true,
              anchor: 'end',      // place at tip of bar
              align: 'end',       // align above the bar
              offset: 6,          // push it further up
              color: '#fff',
              font: { size: 12, weight: 'bold' },
              formatter: Math.round
            }
          },
          scales: {
            x: {
              ticks: { color: '#fff', padding: 10, maxRotation: 45, minRotation: 45 }
            },
            y: {
              beginAtZero: true,
              ticks: { color: '#fff', padding: 5 }
            }
          }
        }
      };

      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(qcConfig))}`
                     + `&backgroundColor=%231e1e1e&width=600&height=400&format=png`;

      const { imageUrl } = await getSteamSkinMeta(skinName);
      if (!imageUrl)
        return message.reply(`No image found for "${skinName}".`);

      const embed = new EmbedBuilder()
        .setTitle(`${cleanName} - Marketplace Quantities`)
        .setDescription(`Requested by ${message.author}`)
        .setColor('#FF8C00')
        .setImage(chartUrl)
        .setThumbnail(imageUrl)
        .addFields({ name: 'Note', value: 'The graph is an estimate and may not be 100% accurate.' })
        .setTimestamp()
        .setFooter({
          text: 'Main Dev : igrek_zaide',
          iconURL: 'https://i.imghippo.com/files/Mb7151RSU.jpg'
        });

      return message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return message.reply('Error while fetching or displaying data.');
    }
  }
};
