//Client Discord
const { Client, Collection, Intents, MessageEmbed, Permissions } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });

//Config
const cf = require('./config.json');
const fs = require('fs');

//Slash Commands
const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');
const commandFiles = fs.readdirSync('./SlashCommand').filter(file => file.endsWith('.js'));
const TEST_GUILD_ID = cf.testguild;

//Handler
const commands2 = [];
const TOKEN = cf.token;
client.commands2 = new Collection();
for (const file of commandFiles) {
    const command = require(`./SlashCommand/${file}`);
    commands2.push(command.data.toJSON());
    client.commands2.set(command.data.name, command);
}

//Bdd
const projet = JSON.parse(fs.readFileSync('./projet.json', 'utf8'));


//Ready
client.on('ready', () => {

    //Mise en route
    console.log(`\nLogged as ${client.user.tag} (${client.user.id}) on ${client.guilds.cache.size} server(s) \n`);
    client.user.setActivity(` l'atelier | /help`, { type: "WATCHING" });


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
                        channelId: "1041101782199316605",
                        scheduledStartTime: new Date(Date.now()+ 5000),
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
                if (interaction.customId === "open-ticket"){
                    let ticket = cf.ticket;
                    // ticket est la catégorie qui on les tickets
                    //on crée un channel dans la catégorie ticket
                    interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
                        type: 'text',
                        parent: ticket,
                        permissionOverwrites: [{
                            id: interaction.user.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                        },
                        {
                            id: interaction.guild.roles.everyone,
                            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                        }
                        ]
                    }).then(async channel => {
                        // on envoie un message dans le channel
                        let embed = new MessageEmbed()
                            .setTitle('Bienvenue sur votre ticket !')
                            .setDescription('Un membre du staff vous répondra dans les plus brefs délais !')
                            .setColor('RANDOM')
                        channel.send({
                            embeds: [embed], content: "<@"+interaction.user.id+">"
                        })
                    })


                }
            } else {
                return;
            }
        }
    }
});

//Guild member add

client.on('guildMemberAdd', member => {
    console.log("Un membre a rejoint le serveur");
    const channel = cf.arriver

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Bienvenue')
        .setDescription(`Bienvenue ${member.user.username} sur le serveur ${member.guild.name} !`)
        .setTimestamp()

    member.guild.channels.cache.get(channel).send({
        embeds: [embed]
    });
    const embed2 = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Bienvenue sur l\'atelier de lyon')
        .setDescription(`n'hésite pas à prendre tes rôles qui te donne accès au projet qui t'intéresse => <#${cf.rolechannel}> ! \nTu as aussi le réglement à lire => <#${cf.reglement}> !\nSi tu as la moindre question le staff est présent pour te répondre !`)
        .setTimestamp()
    member.send({
        embeds: [embed2]
    });
});




//login
client.login(cf.token)
