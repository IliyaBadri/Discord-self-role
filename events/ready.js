const { Events, Client } = require("discord.js");
const ConsoleLogs = require("../strings/ConsoleLogs.js");

/**
* @param {Client} client 
*/
async function Execute(client){
	console.log(ConsoleLogs.ClientLoggedIn(client.user.tag));
}

module.exports = {
	name: Events.ClientReady,
	executeOnce: false,
	Execute
};