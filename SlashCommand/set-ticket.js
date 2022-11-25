const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-ticket')
        .setDescription('permet d\'ouvrir un ticket avec un button'),
    async execute(interaction) {
        // Verifications des permissions
        if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Ticket')
                .setDescription(`Pour ouvrir un ticket, cliquez sur le bouton ci-dessous.`)
                .setTimestamp()
                .setFooter({ text: 'Provient de ' + interaction.guild.name })
                //on crée le bouton
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('open')
                    .setLabel('🔰')
                    .setStyle('PRIMARY'),
                );
            interaction.reply({ embeds: [embed], components: [row] });
        } else {
            interaction.reply('Vous n\'avez pas la permission d\'utiliser cette commande');
        }
    }
};