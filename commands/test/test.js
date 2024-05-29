const { SlashCommandBuilder, Interaction, EmbedBuilder } = require("discord.js");
const Messages = require("../../strings/Messages.js");

/**
* @param { Interaction } interaction 
*/
async function Execute(interaction) {
	const embedContent = Messages.testEmbed;
	const embed = new EmbedBuilder()
		.setColor(Messages.embedColor)
		.setTitle(embedContent.title)
		.setDescription(embedContent.text);

	await interaction.reply({embeds: [embed], ephemeral: true });
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("Test command"),
	Execute
};