module.exports = {
    name: 'disconnect',
    description: 'Disconnects the bot from the server.',
    execute(message, client) {
        message.channel.send('Disconnecting...').then(() => {
            client.destroy();
            console.log('Bot has been disconnected.');
        });
    },
};