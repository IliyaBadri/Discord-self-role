const { REST, Routes } = require('discord.js');
const ConsoleLogs = require("../strings/ConsoleLogs.js")

/**
 * @param {Array} commands
 * @param {string} token
 * @param {string} clientId
 */
async function UpdateSlashCommands(commands, token, clientId){
    let commandsData = [];

    for(const command of commands){
        const commandData = command.data.toJSON();
        commandsData.push(commandData);
    }

    try{
        const rest = new REST().setToken(token);

        const apiResponse = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commandsData },
		);
    } catch (error){
        console.log(ConsoleLogs.CatchedErrorInModule(error, "Error while syncing the commands with Discord API"))
    }
}

module.exports = {
    UpdateSlashCommands
}