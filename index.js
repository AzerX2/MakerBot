//Client Discord
const { Client, Collection, Intents, MessageEmbed, Permissions } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });

//Config
require('dotenv').config();
const fs = require('fs');

//Slash Commands
const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');
const { get } = require('http');
const commandFiles = fs.readdirSync('./SlashCommand').filter(file => file.endsWith('.js'));
const TEST_GUILD_ID = "1041101782199316601";

//Handler
const commands2 = [];
const TOKEN = process.env.TOKEN;
client.commands2 = new Collection();
for (const file of commandFiles) {
    const command = require(`./SlashCommand/${file}`);
    commands2.push(command.data.toJSON());
    client.commands2.set(command.data.name, command);
}

//Bdd
const perm = JSON.parse(fs.readFileSync('./perm.json', 'utf8'));

// Function

async function permEmbed() {
    let guild = client.guilds.cache.get(TEST_GUILD_ID);
    let txt = "Voici les horaires des permanences de cette semaine\n";
    let semaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    for (let i = 0; i < perm.length; i++) {
        if (perm[i] != "0") {
            txt += `\`\`\`prolog\n ${semaine[i]} : ${perm[i].join(" ").replaceAll("-","->")}\`\`\``;
        }

    }


    let embed = new MessageEmbed()
        .setTitle('Permanence')
        .setDescription(txt)
        // footer avec text : nom de la guild et iconURL : l'avatar de la guild
        .setFooter({ text: guild.name, iconURL: guild.iconURL() })
        .setTimestamp()
        .setColor("RED");

    // on va ensuite créé un évenement pour chaque jour, si perm[0] = ["12-14", "14-16"] alors on créé un évenement pour le lundi de 12h à 14h et de 14h à 16h comme quoi l'atelier est ouvert
    let years = new Date(Date.now()).getFullYear();
    let monthIndex = new Date(Date.now()).getMonth();
    let days = new Date(Date.now()).getDate();
    for (let i = 0; i < perm.length; i++) {
        for (let j = 0; j < perm[i].length; j++) {
            if (perm[i][j] == "0") continue;
            let heure = perm[i][j].split('-');
            let minute1 = 0;
            let minute2 = 0;
            if (heure[0].includes(":")) {
                minute1 = heure[0].split(":")[1];
                heure[0] = heure[0].split(":")[0];
            }
            if (heure[1].includes(":")) {
                minute2 = heure[1].split(":")[1];
                heure[1] = heure[1].split(":")[0];
            }
            const event = await guild.scheduledEvents.create({
                name: 'Atelier',
                entityType: 'EXTERNAL',
                channelId: "1087387048215851008",
                scheduledStartTime: new Date(years, monthIndex, days + i, heure[0], minute1),
                scheduledEndTime: new Date(years, monthIndex, days + i, heure[1], minute2),
                privacyLevel: 'GUILD_ONLY',
                status: 'SCHEDULED',
                description: 'L\'atelier est ouvert !',
                entityMetadata: {
                    location: 'Atelier',
                },
            }).catch(console.error);
        }
    }

    // on envoie au channel qui à comme id process.env.perm
    guild.channels.cache.get(process.env.perm).send({ embeds: [embed] });

    // on recupère les 5 derniers messages du channel et si l'utilisateur à l'id de client.user.id on suprime le message
    guild.channels.cache.get(process.env.perm).messages.fetch({
        limit: 5
    }).then(messages => {
        messages.forEach(message => {
            if (message.author.id == client.user.id) {
                message.delete();
            }
        })
    })

}

function killevent() {
    //fonction pour supprimer tout les sheduledEvents de la guild
    let guild = client.guilds.cache.get(TEST_GUILD_ID);
    guild.scheduledEvents.fetch().then(events => {
        events.forEach(event => {
            event.delete();
        })
    })
}
//Ready
client.on('ready', () => {

    //Mise en route
    console.log(`\nLogged as ${client.user.tag} (${client.user.id}) on ${client.guilds.cache.size} server(s) \n`);
    client.user.setActivity(` l'atelier | /help`, { type: "WATCHING" });

    //killevent();
    //permEmbed();
    setInterval(() => {
        // on récupère la date et si c'est lundi 8h on fait permEmbed()
        let date = new Date();
        if (date.getDay() == 1 && date.getHours() == 8) {
            permEmbed();
        }
    }, 1000 * 60 * 60);


    //Enregistrement des slash commandes
    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(TOKEN);
    (async() => {
        try {
            if (!TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands2
                    },
                );
                console.log('Les slash commandes ont été enregistrées.');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                        body: commands2
                    },
                );
                console.log('Les slash commandes ont été enregistrées sur le serveur de test.');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();


});

//Interaction
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands2.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            if (error) console.error(error);
            await interaction.reply({ content: 'Il y a eu une erreur', ephemeral: true });
        }
    } else {
        if (interaction.isSelectMenu()) {
            if (interaction.customId === 'select') {
                // menu déroulant qui permet d'avoir accès au différentes catégories de projets
                const value = interaction.values[0];
                const role = interaction.guild.roles.cache.find(role => role.name === value);
                if (interaction.member.roles.cache.has(role.id)) {
                    interaction.member.roles.remove(role);
                    interaction.reply({
                        content: 'Vous n\'avez plus accès à la catégorie : ' + role.name,
                        ephemeral: true
                    });
                } else {
                    interaction.member.roles.add(role);
                    interaction.reply({
                        content: 'Vous avez maintenant accès à la catégorie : ' + role.name,
                        ephemeral: true
                    });
                }
            }
        } else {
            if (interaction.isButton()) {
                if (interaction.customId === "addtime") {
                    // on utilise GuildScheduledEvent pour créer un événement (external)
                    const event = await interaction.guild.scheduledEvents.create({
                        name: 'Atelier',
                        entityType: 'EXTERNAL',
                        channelId: "1087387048215851008",
                        scheduledStartTime: new Date(Date.now() + 5000),
                        scheduledEndTime: new Date(Date.now() + 2000 * 3600),
                        privacyLevel: 'GUILD_ONLY',
                        status: 'SCHEDULED',
                        description: 'L\'atelier est ouvert !',
                        entityMetadata: {
                            location: 'Atelier',
                        },
                    }).then(

                        // une fois l'événement créé, on envoie un message
                        interaction.reply({
                            content: 'L\'atelier est ouvert ! pendant 2H',
                            ephemeral: true
                        })).catch(err => console.log(err));



                }
            } else {
                return;
            }
        }
    }
});

//login
client.login(process.env.TOKEN);