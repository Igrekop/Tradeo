const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder, MessageFlags } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

// Define a permanent prefix
const PREFIX = '$';

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
    // Ignore messages from bots or messages that don't start with the prefix
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    // Extract the command and arguments
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Find the command in the collection
    const command = client.commands.get(commandName);
    if (!command) {
        return message.reply(`I don't recognize the command "${commandName}".`);
    }

    // Execute the command
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
        const selectedSite = interaction.values[0]; // Récupère la valeur sélectionnée
        const options = interaction.message.components[0].components[0].options; // Récupère les options de la liste déroulante
        const selectedOption = options.find(option => option.value === selectedSite); // Trouve l'option sélectionnée

        if (!selectedOption) {
            return interaction.reply({ content: 'An error occurred while processing your selection.', flags: MessageFlags.Ephemeral });
        }

        // Récupère les informations de l'option sélectionnée
        const [site, priceWithCurrency] = selectedOption.label.split(' - ');
        const price = parseFloat(priceWithCurrency.split(' ')[0]);
        const currency = priceWithCurrency.split(' ')[1];
        const description = selectedOption.description;

        // Récupère le prix de référence (Buff)
        const buffOption = options.find(option => option.value === 'buff');
        const buffPrice = parseFloat(buffOption.label.split(' - ')[1].split(' ')[0]);

        // Calcul de la différence en pourcentage
        const difference = (((price - buffPrice) / buffPrice) * 100).toFixed(2);

        // Crée un embed pour afficher les informations
        const embed = new EmbedBuilder()
            .setTitle(`Price Comparison: ${site}`)
            .setDescription(`Here is the price comparison between **${capitalizeWords(site)}** and **Buff**.`)
            .addFields(
                { name: `${site} Price`, value: `${price.toFixed(2)} ${currency}`, inline: true },
                { name: `Buff Price`, value: `${buffPrice.toFixed(2)} ${currency}`, inline: true },
                { name: `Difference`, value: `${difference}% ${difference < 0 ? 'cheaper' : 'more expensive'}`, inline: true }
            )
            .setColor(difference < 0 ? '#4CAF50' : '#FF5733') // Vert si moins cher, rouge sinon
            .setFooter({ text: 'Comparison provided by Tradeo' })
            .setTimestamp();

        // Envoie l'embed uniquement à la personne qui a cliqué
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    
    const express = require('express')
    const app = express()
    const port = process.env.PORT || 4000 
        
    app.get('/', (req, res) => {
    res.send('Hello World!')
    })
        
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}});

// Log in to Discord with your client's token
client.login(token);

function capitalizeWords(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}