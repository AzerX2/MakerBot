const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const cf = require('../config.json');

// commande pour crée une facture qui va crée un channel dans la catégorie facture

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invoice')
        .setDescription('crée un channel pour une facture')
        .addStringOption(option => option.setName('nom').setDescription('nom du projet').setRequired(true)),
    async execute(interaction) {
        // vérifie des permissions
        if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            let nom = interaction.options.getString('nom');
            // création du channel
            interaction.guild.channels.create(nom, {
                type: 'GUILD_TEXT',
                permissionOverwrites: [{
                    id: interaction.guild.roles.everyone,
                    deny: ['VIEW_CHANNEL'],
                }, {
                    id: interaction.guild.roles.cache.find(role => role.name === "staff"),
                    allow: ['VIEW_CHANNEL', "SEND_MESSAGES"],
                }, ],
                parent: interaction.guild.channels.cache.find(channel => channel.id === cf.invoice),
            }).then(channel => {
                //on envoie dans le channel un embed avec les infos du projet
                const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(nom)
                    .setDescription("Facture")
                    .setTimestamp()
                    .setFooter({ text: 'Provient de ' + interaction.guild.name })
                channel.send({ embeds: [embed] });
            }).catch(console.error);
            // envoie un message de confirmation
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Facture créée')
                .setDescription('Le channel ' + nom + ' a été créé')
                .setTimestamp()
                .setFooter({ text: 'Provient de ' + interaction.guild.name })
            interaction.reply({ embeds: [embed] });

        } else {
            interaction.reply({ content: 'Vous n\'avez pas les permissions pour faire cette commande', ephemeral: true });
        }
    }
};