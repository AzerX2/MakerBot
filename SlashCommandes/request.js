const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const cf = require('../config.json');

// Permet de faire une demande de création de projet pour l'atelier (accessible à tous)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('permet de faire une demande pour crée un projet')
        .addStringOption(option => option.setName('nom').setDescription('nom du projet').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('description du projet').setRequired(true))
        .addStringOption(option => option.setName('categorie').setDescription('catégorie du projet').setRequired(true)),
    async execute(interaction) {
        let channelstaff = interaction.guild.channels.cache.get(cf.channelstaff);
        let nom = interaction.options.getString('nom');
        let description = interaction.options.getString('description');
        let categorie = interaction.options.getString('categorie');
        // envoie un message dans le channel staff
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Demande de projet')
            .setDescription(`✅ - ${interaction.user.username} a fait une demande de projet`)
            .addFields({ name: 'Nom du projet', value: nom }, { name: 'Description du projet', value: description }, { name: 'Catégorie du projet', value: categorie }, )
            .setTimestamp()
            .setFooter({ text: 'Provient de ' + interaction.guild.name })
        channelstaff.send({ embeds: [embed] });
        // envoie un message de confirmation
        interaction.reply({ content: '✅ - Votre demande a bien été envoyé au staff' });

    }
};