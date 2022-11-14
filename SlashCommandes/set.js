const { MessageEmbed, Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

// permet d'envoyer le message avec le menu déroulant ou on peut choisir les projets que l'on veut voir

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Permet de mettre le message de l\'obtention des rôles'),

    async execute(interaction) {
        // Verifications des permissions
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            interaction.reply('Vous n\'avez pas la permission d\'utiliser cette commande');
        } else {
            // on crée le menu déroulant
            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Aucun rôle sélectionné')
                    .addOptions([{
                            label: 'Rôle 1',
                            description: 'Donne accès à la catégorie 1',
                            value: 'role1',
                        },
                        {
                            label: 'Rôle 2',
                            description: 'Donne accès à la catégorie 2',
                            value: 'role2',
                        }
                    ]),
                );
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Rôles')
                .setDescription(`Vous avez ici la liste des rôles que vous pouvez obtenir en cliquant sur le bouton ci-dessous.`)
                .setTimestamp()
                .setFooter({ text: 'Provient de ' + interaction.guild.name })
            interaction.reply({ embeds: [embed], components: [row] });
        }
    }
}