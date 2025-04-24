module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    execute(message) {
        console.log('Ping command executed'); // Ajoutez ceci pour déboguer
        message.reply('Pong!');
    },
};