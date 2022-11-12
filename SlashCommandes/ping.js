const { SlashCommandBuilder } = require('@discordjs/builders');

// commande ping (surtout utiliser pour tester le bot)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répond par pong'),
    async execute(interaction) {
        interaction.reply({ content: 'Pong' })
    }
};