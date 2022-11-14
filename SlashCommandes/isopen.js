const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

// permet de savoir si l'ateliers est ouvert ou fermé

module.exports = {
    data: new SlashCommandBuilder()
        .setName('isopen')
        .setDescription('permet de savoir si l\'atelier est ouvert'),
    async execute(interaction) {
        const open = JSON.parse(fs.readFileSync('./isopen.json', 'utf8'));
        // open contient une date 
        if (open[interaction.guild.id] > Date.now()) {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Atelier')
                .setDescription(`✅ - L'atelier est ouvert`)
                .setTimestamp()
                .setFooter({ text: 'Provient de ' + interaction.guild.name })
            interaction.reply({ embeds: [embed] });
        } else {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Atelier')
                .setDescription(`❌ - L'atelier est fermé`)
                .setTimestamp()
                .setFooter({ text: 'Provient de ' + interaction.guild.name })
            interaction.reply({ embeds: [embed] });
        }
    }
};