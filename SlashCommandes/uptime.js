const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { SlashCommandBuilder } = require('@discordjs/builders');

//montre le temps d'activité du bot

module.exports = {

    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Montre le temps de fonctionnement du bot'),
    async execute(interaction) {
        const d = moment.duration(interaction.client.uptime);
        const days = (d.days() == 1) ? `${d.days()} jour` : `${d.days()} jours`;
        const hours = (d.hours() == 1) ? `${d.hours()} heure` : `${d.hours()} heures`;
        const minutes = (d.minutes() == 1) ? `${d.minutes()} minute` : `${d.minutes()} minutes`;
        const seconds = (d.seconds() == 1) ? `${d.seconds()} seconde` : `${d.seconds()} secondes`;
        const date = moment().subtract(d, 'ms').format('dddd, MMMM Do YYYY');
        const embed = new MessageEmbed()
            .setTitle('Uptime')
            .setDescription(`\`\`\`prolog\n${days}, ${hours}, ${minutes}, and ${seconds}\`\`\``)
            .addField('Date de lancement', date)
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(interaction.guild.me.displayHexColor);
        interaction.reply({ embeds: [embed] });
    }
}