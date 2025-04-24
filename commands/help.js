const { EmbedBuilder, User, userMention } = require('discord.js');
const fs = require('fs');
const { userInfo } = require('os');

module.exports = {
    name: 'help',
    description: 'Displays a list of available commands.',
    execute(message, client) {
        // Crée un embed
        const helpEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Here are the available commands !')
            .setAuthor({ name: 'Tradeo' })
            .setDescription(`${userMention(message.author.id)} type \`$help\` !`)
            .setThumbnail('https://i.imghippo.com/files/MhzT2257OU.png')         
            .setTimestamp()
            .setFooter({ text: 'Main Dev : igrek_zaide', iconURL: 'https://i.imghippo.com/files/Mb7151RSU.jpg' })

        // Parcourt toutes les commandes dans client.commands
        client.commands.forEach(command => {
            helpEmbed.addFields({
                name: `\`$${command.name}\``,
                value: command.description || 'Pas de description disponible.',
                inline: true, // Affiche les champs en ligne
            });
        });

        helpEmbed.addFields(
                { name: 'Join our main server!', value: '[Click here to join](https://discord.gg/sS68ztA3)', inline: false }
            )   

        // Envoie l'embed dans le canal
        message.channel.send({ embeds: [helpEmbed] });
    },
};