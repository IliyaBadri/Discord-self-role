const { Events, Interaction, EmbedBuilder } = require('discord.js');
const ConsoleLogs = require("../strings/ConsoleLogs.js");
const Messages = require("../strings/Messages.js");

/**
* @param { Interaction } interaction 
*/
async function Execute(interaction){
    if (
        ! interaction.isChatInputCommand() ||
        ! interaction.inGuild()
    ) {
        return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.log(ConsoleLogs.InvalidCommandRecievedFromDisocrdApi(interaction.commandName));
        return;
    }

    try {
        await command.Execute(interaction);
    } catch (error) {
        console.log(ConsoleLogs.CatchedErrorInModule(error.toString(), `Command execution: ${interaction.commandName}`));

        const errorContents = Messages.executionErrorEmbed;

        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContents.title)
            .setDescription(errorContents.text);

        const replyOptions = { 
            embeds: [errorEmbed], 
            ephemeral: true 
        };
            
        try{
            if (
                interaction.replied || 
                interaction.deferred
            ) {
                await interaction.followUp(replyOptions);
            } else {
                await interaction.reply(replyOptions);
            }
        } catch {}
    } 
}

module.exports = {
	name: Events.InteractionCreate,
    executeOnce: false,
    Execute
};