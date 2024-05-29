const FileSystem = require("fs");
const Path = require("path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

const Config = require("./config.json");
const Environment = require("./environment.json");

const Database = require("./database/Database.js");
const RestApi = require("./discord/RestApi.js");
const ConsoleLogs = require("./strings/ConsoleLogs.js");

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
 * @param {string} modulePath
 * @returns {boolean}
 */
function IsModuleValid(module, moduleProperties, modulePath){
	for (const moduleProperty of moduleProperties){
		if(!(moduleProperty.name in module)){
			console.log(ConsoleLogs.NoArgumentInModule(moduleProperty.name, modulePath));
			return false;
		}
		if (typeof module[moduleProperty.name] !== moduleProperty.type){
			console.log(ConsoleLogs.WrongArgumentTypeInModule(moduleProperty.name, moduleProperty.type, modulePath));
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

	const commandFoldersPath = Path.join(__dirname, Environment.commands);

	/**
	 * @param {string} directoryName
	 * @returns {boolean}
	 */
	function CommandFolderFilter(directoryName){
		const folderPath = Path.join(commandFoldersPath, directoryName);
		const folderStatus = FileSystem.statSync(folderPath);
		return folderStatus.isDirectory();
	}

	const commandFolders = FileSystem.readdirSync(commandFoldersPath).filter(CommandFolderFilter);

	for (const commandFolder of commandFolders) {
		const commandsPath = Path.join(commandFoldersPath, commandFolder);

		/**
		 * @param {string} fileName
		 * @returns {boolean}
		 */
		function CommandFileFilter(fileName){
			const filePath = Path.join(commandsPath, fileName);
			const fileStatus = FileSystem.statSync(filePath);
			const fileExtension = Path.extname(filePath);
			return (fileStatus.isFile() && fileExtension === ".js");
		}

		const commandFiles = FileSystem.readdirSync(commandsPath).filter(CommandFileFilter);

		for (const commandFile of commandFiles) {
			const commandFilePath = Path.join(commandsPath, commandFile);
			const command = require(commandFilePath);

			const commandModuleProperties = [
				new ModuleProperty("data", "object"),
				new ModuleProperty("Execute", "function")
			];
			if(!IsModuleValid(command, commandModuleProperties, commandFilePath)){
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
	
	const eventsPath = Path.join(__dirname, Environment.events);
	const eventFiles = FileSystem.readdirSync(eventsPath).filter(file => {
		const filePath = Path.join(eventsPath, file);
		const fileStatus = FileSystem.statSync(filePath);
		return (fileStatus.isFile() && file.endsWith('.js'));
	});
	for (const eventFile of eventFiles) {
		const eventFilePath = Path.join(eventsPath, eventFile);
		const event = require(eventFilePath);
		const eventModuleProperties = [
			new ModuleProperty("name", "string"),
			new ModuleProperty("executeOnce", "boolean"),
			new ModuleProperty("Execute", "function")
		];
		if(!IsModuleValid(event, eventModuleProperties, eventFilePath)){
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