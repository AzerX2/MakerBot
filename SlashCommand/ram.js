const { MessageEmbed } = require('discord.js');
const os = require('os');
const { SlashCommandBuilder } = require('@discordjs/builders');

// montre la mémoire utilisée par le bot

module.exports = {

    data: new SlashCommandBuilder()
        .setName('ram')
        .setDescription('Montre la ram utilisé'),
    async execute(interaction) {

        // command ping with message embed 
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Ram')
            .setDescription(`Vous avez ici la ram utilisé actuellement par le bot. et la ram total de la machine.`)
            .addField("Ram actuelle", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)
            .addField("Ram totale", `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`)
            .setTimestamp()
            .setFooter({ text: 'Provient de ' + interaction.guild.name })
        interaction.reply({ embeds: [embed] });
    }
}