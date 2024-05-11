const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, Interaction } = require("discord.js");
const Messages = require("../../strings/Messages.js");
const DatabaseModule = require("../../database/Database.js");
const DatabaseManager = require("../../database/DatabaseManager.js");

/**
* @param { Interaction } interaction 
*/
async function Execute(interaction) {
    if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
        const errorContent = Messages.MissingPermission("ADMINISTRATOR");
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await interaction.reply({embeds: [errorEmbed], ephemeral: true });
        return;
    }

    const categoryName = interaction.options.getString("name");

    const categoryExists = await DatabaseManager.IsCategory(interaction.guild.id, categoryName);
    if(categoryExists){
        const errorContent = Messages.CategoryExists(categoryName);
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await interaction.reply({embeds: [errorEmbed], ephemeral: true });
        return;
    }

    const insertCategoryQuery = "INSERT INTO categories (guildId, category) VALUES (?, ?)";
    const insertCategoryQueryParameters = [interaction.guild.id, categoryName];

    await DatabaseModule.GetRunnerPromise(insertCategoryQuery, insertCategoryQueryParameters);

	const embedContent = Messages.CategoryCreated(categoryName, interaction.guild.name);
	const embed = new EmbedBuilder()
		.setColor(Messages.embedColor)
		.setTitle(embedContent.title)
		.setDescription(embedContent.text)
        .setAuthor({ name: interaction.member.name, iconURL: interaction.member.avatarURL });

	await interaction.reply({embeds: [embed], ephemeral: false });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("create-category")
		.setDescription("Creates a new role category for this server.")
        .addStringOption((option) => {
            option
                .setName("name")
                .setDescription("The category name")
                .setRequired(true);

            return option;
        }),
    Execute
};