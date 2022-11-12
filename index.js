//Client Discord
const { Client, Collection, Intents, MessageEmbed, Permissions } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

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

//function
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

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
    if (!interaction.isCommand()) return;
    const command = client.commands2.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'Il y a eu une erreur', ephemeral: true });
    }
});

//login
client.login(cf.token)