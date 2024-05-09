const { REST, Routes } = require('discord.js');

/**
 * @param {Array} commands
 * @param {string} token
 * @param {string} clientId
 */
async function UpdateSlashCommands(commands, token, clientId){
    let commandsData = [];

    for(const command of commands){
        commandsData.push(command.data.toJSON());
    }

    try{
        const rest = new REST().setToken(token);

        const apiResponse = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
    } catch (error){

    }
}

module.exports = {
    UpdateSlashCommands
}