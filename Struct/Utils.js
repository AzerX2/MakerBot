//Struct Général
const { sync } = require("glob");
const { resolve } = require("path");

module.exports = class Utils {
    constructor(client) {
        this.client = client;
    }

    async loadCommands() {
        const commandFiles = sync(resolve("./commands/**/*.js"));

        let array = [];
        let array2 = [];

        for (const filepath of commandFiles) {
            const command = require(filepath);
            if (command) {
                if (!command.ownerOnly) {
                    this.client.commands.set(command.name, command);
                    array.push(command);
                } else {
                    this.client.commands.set(command.name, command);
                    array2.push(command);
                }
            } else {
                continue;
            }

            this.client.on("ready", async(client) => {
                await client.application.commands.set(array);
                await client.guilds.cache
                    .get("")
                    .commands.set(array2);
            });
        }
        this.client.logger.success("Command", "Tout les commandes ont été chargés");
    }

    async loadEvents() {
        const eventFiles = sync(resolve("./events/*.js"));

        for (const filepath of eventFiles) {
            const event = require(filepath);
            if (event) {
                this.client.on(event.name, event.run.bind(null, this.client));
            } else {
                continue;
            }
        }

        this.client.logger.success("Events", "Tout les events ont été chargés");
    }

    async loadButtons() {
        const buttonFiles = sync(resolve("./buttons/*.js"));

        for (const filepath of buttonFiles) {
            const button = require(filepath);
            if (button) {
                this.client.buttons.set(button.name, button);
            } else {
                continue;
            }
        }

        this.client.logger.success("Buttons", "Tout les boutons ont été chargés");
    }
};