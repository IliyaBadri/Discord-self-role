const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, Interaction } = require("discord.js");
const Messages = require("../../strings/Messages.js");
const DatabaseModule = require("../../database/Database.js");
const DatabaseManager = require("../../database/DatabaseManager.js");

/**
 * 
 * @param {Interaction} interaction 
 */
async function Execute(interaction){
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
        const errorContent = Messages.MissingPermission("ADMINISTRATOR");
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await interaction.reply({embeds: [errorEmbed], ephemeral: true });
        return;
    }

    const categoryName = interaction.options.getString("category");

    const categoryExists = await DatabaseManager.IsCategory(interaction.guild.id, categoryName);

    if(!categoryExists) {
        const errorContent = Messages.CategoryDoesNotExists(categoryName);
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await interaction.reply({embeds: [errorEmbed], ephemeral: true });
        return;
    }

    const deleteCategoryQuery = "DELETE FROM categories WHERE guildId = ? AND category = ?";
    const deleteCategoryQueryParameters = [interaction.guild.id, categoryName];

    await DatabaseModule.GetRunnerPromise(deleteCategoryQuery, deleteCategoryQueryParameters);

    const deleteRolesQuery = "DELETE FROM roles WHERE guildId = ? AND category = ?";
    const deleteRolesQueryParameters = deleteCategoryQueryParameters;

    await DatabaseModule.GetRunnerPromise(deleteRolesQuery, deleteRolesQueryParameters);

    const embedContent = Messages.CategoryDeleted(categoryName, interaction.guild.name);
	const embed = new EmbedBuilder()
		.setColor(Messages.embedColor)
		.setTitle(embedContent.title)
		.setDescription(embedContent.text)
        .setAuthor({ name: interaction.member.name, iconURL: interaction.member.avatarURL });

	await interaction.reply({embeds: [embed], ephemeral: false });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delete-category")
		.setDescription("Deletes a category (and its roles).")
        .addStringOption((option) =>{
            option
                .setName("category")
                .setDescription("The category name")
                .setRequired(true);
            
            return option;
        }),
    Execute
};