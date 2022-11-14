const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

//montre la liste des commandes

module.exports = {

    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes'),

    async execute(interaction) {
        const prefix = "/";
        const newemb = new MessageEmbed()
            .setTitle('Help')
            .setDescription(`\`\`\`prolog\n${prefix}isopen\n${prefix}ping\n${prefix}ram\n${prefix}start\n${prefix}request\n${prefix}invoice\n${prefix}set\n${prefix}uptime\`\`\``)
            .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(interaction.guild.me.displayHexColor);
        interaction.reply({
            embeds: [newemb]
        })
    }
}