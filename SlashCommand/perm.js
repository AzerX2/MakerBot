const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('perm')
        .setDescription('pour config perm, forme à respecter : 12-14 15-17 donc dispo de 12h à 14h et de 15h à 17h')
        // on mets chaque jour de la semaine en plus, donc lun, mar, mer, jeu, ven et les options sont required donc on mets true
        .addStringOption(option => option.setName('lun').setDescription('Permanence du lundi').setRequired(true))
        .addStringOption(option => option.setName('mar').setDescription('Permanence du mardi').setRequired(true))
        .addStringOption(option => option.setName('mer').setDescription('Permanence du mercredi').setRequired(true))
        .addStringOption(option => option.setName('jeu').setDescription('Permanence du jeudi').setRequired(true))
        .addStringOption(option => option.setName('ven').setDescription('Permanence du vendredi').setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply('Vous n\'avez pas la permission d\'utiliser cette commande');
        const lun = interaction.options.getString('lun');
        const mar = interaction.options.getString('mar');
        const mer = interaction.options.getString('mer');
        const jeu = interaction.options.getString('jeu');
        const ven = interaction.options.getString('ven');

        let perm = JSON.parse(fs.readFileSync('./perm.json', 'utf8'));
        
        // on push lun.split(" "), mar.split(" "), mer.split(" "), jeu.split(" "), ven.split(" ") dans perm
        perm = []
        perm.push(lun.split(" "), mar.split(" "), mer.split(" "), jeu.split(" "), ven.split(" "));

        // on enregistre le fichier perm.json
        fs.writeFile('./perm.json', JSON.stringify(perm), (err) => {
            if (err) console.log(err);
        });

        // on envoie un message de confirmation
        let embed = new MessageEmbed()
            .setTitle('Permanence')
            //on affiche les permission par jour 
            .setDescription(`\`\`\`prolog\nLundi : ${lun}\nMardi : ${mar}\nMercredi : ${mer}\nJeudi : ${jeu}\nVendredi : ${ven}\`\`\``)
            .setFooter({ text: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(interaction.guild.me.displayHexColor);
        interaction.reply({
            embeds: [embed]
        })


    }
}