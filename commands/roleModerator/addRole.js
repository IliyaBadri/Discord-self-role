const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, Interaction } = require('discord.js');
const Messages = require("../../strings/Messages.js");
const DatabaseModule = require("../../database/Database.js");
const DatabaseManager = require("../../database/DatabaseManager.js");

/**
* @param { Interaction } interaction 
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
    const selectedRole = interaction.options.getRole("role");

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

    const roleExists = await DatabaseManager.IsRole(interaction.guild.id, categoryName, selectedRole.id);

    if(roleExists) {
        const errorContent = Messages.RoleAlreadyInCategory(categoryName, selectedRole.name);
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await interaction.reply({embeds: [errorEmbed], ephemeral: true });
        return;
    }

    const insertRoleQuery = "INSERT INTO roles (guildId, category, roleId) VALUES (?, ?, ?)";
    const insertRoleQueryParameters = [interaction.guild.id, categoryName, selectedRole.id];

    await DatabaseModule.GetRunnerPromise(insertRoleQuery, insertRoleQueryParameters);

	const embedContent = Messages.CategoryCreated(categoryName, interaction.guild.name, selectedRole.name);
	const embed = new EmbedBuilder()
		.setColor(Messages.embedColor)
		.setTitle(embedContent.title)
		.setDescription(embedContent.text)
        .setAuthor({ name: interaction.member.name, iconURL: interaction.member.avatarURL });

	await interaction.reply({embeds: [embed], ephemeral: false });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-role")
		.setDescription("Adds a roles to a category in this server.")
        .addStringOption((option) => {
            option
                .setName("category")
                .setDescription("The category name")
                .setRequired(true)

            return option;
        })
        .addRoleOption((option) => {
            option
                .setName("role")
                .setDescription("The role")
                .setRequired(true)

            return option;
        }),
    
    Execute
};