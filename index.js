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
const commandFiles = fs.readdirSync('./SlashCommandes').filter(file => file.endsWith('.js'));
const TEST_GUILD_ID = cf.testguild;

//Handler
const commands2 = [];
const TOKEN = cf.token;
client.commands2 = new Collection();
for (const file of commandFiles) {
    const command = require(`./SlashCommandes/${file}`);
    commands2.push(command.data.toJSON());
    client.commands2.set(command.data.name, command);
}

//Bdd
const isopen = JSON.parse(fs.readFileSync('./isopen.json', 'utf8'));
const projet = JSON.parse(fs.readFileSync('./projet.json', 'utf8'));

//function
function verif() {
    if (!isopen[TEST_GUILD_ID]) {
        isopen[TEST_GUILD_ID] = Date.now();
        fs.writeFileSync('./isopen.json', JSON.stringify(isopen, null, 4), (err) => {
            if (err) console.log(err);
        });
    }
    return isopen[TEST_GUILD_ID] > Date.now()
}


//Ready
client.on('ready', () => {

    //Mise en route
    console.log(`\nLogged as ${client.user.tag} (${client.user.id}) on ${client.guilds.cache.size} server(s) \n`);
    client.user.setActivity(` l'atelier | /help`, { type: "WATCHING" });

    //Verification toute les heures si l'atelier est ouvert ou non
    setInterval(() => {
        const Channel = client.channels.cache.get(cf.isopen);
        Channel.messages.fetch({ limit: 5 }).then(messages => {
            messages.forEach(message => {
                if (message.author.id == client.user.id) {
                    message.delete();
                }
            });
        });
        const guild = client.guilds.cache.get(cf.testguild);
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Atelier')
            .setTimestamp()
            .setFooter({ text: 'Provient de ' + guild.name })
        if (verif()) {
            embed.setDescription(`L'atelier est ouvert`)
            client.channels.cache.get(cf.isopen).send({ embeds: [embed] });
        } else {
            embed.setDescription(`L'atelier est fermé`)
            client.channels.cache.get(cf.isopen).send({ embeds: [embed] });
        }
    }, 600000); //1800000 = 30 minutes | 600000 = 10 minutes


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
                    isopen[interaction.guild.id] = Date.now() + 2 * 3600000; //2 * 3600000 = 2 heures
                    fs.writeFileSync('./isopen.json', JSON.stringify(isopen));
                    interaction.reply({
                        content: 'Le temps a été ajouté !',
                        ephemeral: true
                    });
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