const { Events  } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	async execute(c) {
		console.log(`Ready! Logged in as ${c.user.tag}`);
	},
};