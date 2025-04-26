const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

// Define a permanent prefix
const PREFIX = '$';

// -- Ajoute Express ici --
const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});
// ------------------------

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Create a collection to store commands
client.commands = new Collection();

// Load command files dynamically
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: 'use $help !', type: 3 }],
    });
});

// Listen for messages
client.on(Events.MessageCreate, message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) {
        return message.reply(`I don't recognize the command "${commandName}".`);
    }

    try {
        command.execute(message, client);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'price_comparison') {
        const selectedSite = interaction.values[0];
        const options = interaction.message.components[0].components[0].options;
        const selectedOption = options.find(option => option.value === selectedSite);

        if (!selectedOption) {
            return interaction.reply({ content: 'An error occurred while processing your selection.', flags: MessageFlags.Ephemeral });
        }

        const [site, priceWithCurrency] = selectedOption.label.split(' - ');
        const price = parseFloat(priceWithCurrency.split(' ')[0]);
        const currency = priceWithCurrency.split(' ')[1];
        const description = selectedOption.description;

        const buffOption = options.find(option => option.value === 'buff');
        const buffPrice = parseFloat(buffOption.label.split(' - ')[1].split(' ')[0]);

        const difference = (((price - buffPrice) / buffPrice) * 100).toFixed(2);

        const embed = new EmbedBuilder()
            .setTitle(`Price Comparison: ${site}`)
            .setDescription(`Here is the price comparison between **${capitalizeWords(site)}** and **Buff**.`)
            .addFields(
                { name: `${site} Price`, value: `${price.toFixed(2)} ${currency}`, inline: true },
                { name: `Buff Price`, value: `${buffPrice.toFixed(2)} ${currency}`, inline: true },
                { name: `Difference`, value: `${difference}% ${difference < 0 ? 'cheaper' : 'more expensive'}`, inline: true }
            )
            .setColor(difference < 0 ? '#4CAF50' : '#FF5733')
            .setFooter({ text: 'Comparison provided by Tradeo' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});

// Log in to Discord with your client's token
client.login(token);

function capitalizeWords(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
