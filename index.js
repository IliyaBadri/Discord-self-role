const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes, Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, clientId } = require('./config.json');
const sqlite3 = require('sqlite3').verbose();
require("./deployCommands.js")

const db = new sqlite3.Database('database.db');
db.serialize(() => {
	db.run('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, guildId TEXT, category TEXT)');
	db.run('CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY, guildId TEXT, category TEXT, roleId TEXT)');
});

db.close();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const eventFile of eventFiles) {
	const eventFilePath = path.join(eventsPath, eventFile);
	const event = require(eventFilePath);
	if ('name' in event && 'execute' in event) {
		if(event.once){
			client.once(event.name, async (...args) => {
				event.execute(...args)
			})
		} else {
			client.on(event.name, async (...args) => {
				event.execute(...args)
			})
		}
		
	} else {
		console.log(`[WARNING] The event at ${eventFilePath} is missing a required "name" or "execute" property.`);
	}
}

client.login(token);