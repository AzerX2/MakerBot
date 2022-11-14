const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const fs = require('fs');
const cf = require('../config.json');

// permet de créer un channel pour un nouveau projet (accessible au staff)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('start a projet')
        .addStringOption(option => option.setName('nom').setDescription('nom du projet').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('description du projet').setRequired(true))
        .addStringOption(option => option.setName('categorie').setDescription('catégorie du projet').setRequired(true).addChoices({ value: 'catégorie1', name: 'catégorie1' }, { value: 'catégorie2', name: 'catégorie2' })),
    async execute(interaction) {
        if (interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            const projet = JSON.parse(fs.readFileSync('./projet.json', 'utf8'));
            const nom = interaction.options.getString('nom');
            const description = interaction.options.getString('description');
            const categorie = interaction.options.getString('categorie');

            for (let i = 0; i < projet.length; i++) {
                if (projet[i].nom == nom) {
                    interaction.reply({ content: '❌ - Ce projet existe déjà' });
                    return;
                }
            }
            let obj = { nom, description, categorie };
            projet.push(obj);
            fs.writeFileSync('./projet.json', JSON.stringify(projet, null, 4));


            let searchrole = "role1";
            let cat = cf.category1;
            if (categorie == "catégorie2") {
                searchrole = "role2";
                cat = cf.category2;
            }
            interaction.guild.channels.create(nom, {
                    type: 'GUILD_TEXT',
                    permissionOverwrites: [{
                            id: interaction.guild.roles.everyone,
                            deny: ['VIEW_CHANNEL'],
                        },
                        {
                            id: interaction.guild.roles.cache.find(role => role.name === searchrole),
                            allow: ['VIEW_CHANNEL'],
                        },
                    ],
                    parent: interaction.guild.channels.cache.find(channel => channel.id === cat),
                })
                .then(channel => {
                    //on envoie dans le channel un embed avec les infos du projet
                    const embed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(nom)
                        .setDescription(description)
                        .setTimestamp()
                        .setFooter({ text: 'Provient de ' + interaction.guild.name })
                    channel.send({ embeds: [embed] });
                })
                .catch(console.error);


            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Projet')
                .setDescription(`✅ - Le projet ${nom} a bien été créé`)
                .setTimestamp()
                .setFooter({ text: 'Provient de ' + interaction.guild.name })
            interaction.reply({ embeds: [embed] });




        } else {
            interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande' });
        }
    }

};