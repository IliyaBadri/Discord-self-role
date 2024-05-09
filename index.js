const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

const Config = require("./config.json");
const Environment = require("./environment.json");

const Database = require("./database/Database.js");
const RestApi = require("./discord/RestApi.js");
const ConsoleLogs = require("./strings/ConsoleLogs.js")

class ModuleProperty {
	constructor(name, type){
		this.name = name;
		this.type = type;
	}
}

/**
 * 
 * @param {Array<ModuleProperty>} moduleProperties 
 * @param {object} module 
 * @returns {boolean}
 */
function IsModuleValid(module, moduleProperties){
	for (const moduleProperty of moduleProperties){
		if(!(moduleProperty.name in module)){
			console.log(ConsoleLogs.NoArgumentInModule(moduleProperty.name, eventFilePath));
			return false;
		}
		if (typeof module[moduleProperty.name] !== moduleProperty.type){
			console.log(ConsoleLogs.WrongArgumentTypeInModule(moduleProperty.name, moduleProperty.type, eventFilePath));
			return false;
		}
	}

	return true;
}

/**
 * @returns {Array}
 */
function GetCommands(){
	let commands = [];

	const commandFoldersPath = path.join(__dirname, Environment.commands);
	const commandFolders = fs.readdirSync(commandFoldersPath).filter(folder => {
		const folderPath = path.join(commandFoldersPath, folder);
		const folderStatus = fs.statSync(folderPath);
		return folderStatus.isDirectory();
	});
	for (const commandFolder of commandFolders) {
		const commandsPath = path.join(commandFoldersPath, commandFolder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => {
			const filePath = path.join(commandsPath, file);
			const fileStatus = fs.statSync(filePath);
			return (fileStatus.isFile() && file.endsWith('.js'));
		});
		for (const commandFile of commandFiles) {
			const commandFilePath = path.join(commandsPath, commandFile);
			const command = require(commandFilePath);

			const commandModuleProperties = [
				new ModuleProperty("data", "object"),
				new ModuleProperty("Execute", "function")
			];
			if(!IsModuleValid(command, commandModuleProperties)){
				continue;
			}

			commands.push(command);
		}
	}

	return commands;
}

/**
 * @returns {Array}
 */
function GetEvents(){
	let events = [];
	
	const eventsPath = path.join(__dirname, Environment.events);
	const eventFiles = fs.readdirSync(eventsPath).filter(file => {
		const filePath = path.join(eventsPath, file);
		const fileStatus = fs.statSync(filePath);
		return (fileStatus.isFile() && file.endsWith('.js'));
	});
	for (const eventFile of eventFiles) {
		const eventFilePath = path.join(eventsPath, eventFile);
		const event = require(eventFilePath);
		const eventModuleProperties = [
			new ModuleProperty("name", "string"),
			new ModuleProperty("executeOnce", "boolean"),
			new ModuleProperty("Execute", "function")
		];
		if(!IsModuleValid(event, eventModuleProperties)){
			continue;
		}

		events.push(event);
	}

	return events;
}

async function Main(){
	await Database.SetupDatabase();

	const commands = GetCommands();

	await RestApi.UpdateSlashCommands(commands, Config.token, Config.clientId);

	const client = new Client({ intents: [GatewayIntentBits.Guilds] });

	client.commands = new Collection();

	for (const command of commands){
		client.commands.set(command.data.name, command);
	}

	const events = GetEvents();

	for (const event of events){
		async function ExecuteEvent(...arguments){
			try{
				await event.Execute(...arguments);
			} catch (error) {
				console.log(ConsoleLogs.CatchedErrorInModule(error.toString(), `Event: ${event.name}`));
			}
		}
		if(event.executeOnce){
			client.once(event.name, ExecuteEvent);
		} else {
			client.on(event.name, ExecuteEvent);
		}
	}
	
	try{
		await client.login(Config.token);
	} catch (error) {
		console.log(ConsoleLogs.CatchedErrorInModule(error.toString(), `Main: Login`));
	}
}

Main();