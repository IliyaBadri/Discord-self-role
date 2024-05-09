const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, Interaction } = require('discord.js');
const Messages = require("../../strings/Messages.js");
const DatabaseModule = require("../../database/Database.js");

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

    const selectRolesQuery = "SELECT * FROM roles WHERE guildId = ?";
    const selectRolesQueryParameters = [interaction.guild.id];
    const databaseRoles = await DatabaseModule.GetGetAllPromise(selectRolesQuery, selectRolesQueryParameters);

    let roles = [];

    const guildRoles = await interaction.guild.roles.fetch();

    for(const databaseRole of databaseRoles){
        const roleExists = await guildRoles.has(databaseRole.roleId);
        if(!roleExists){
            const deleteRoleQuery = "DELETE FROM roles WHERE id = ?";
            const deleteRoleQueryParameters = [databaseRole.id];
            await DatabaseModule.GetRunnerPromise(deleteRoleQuery, deleteRoleQueryParameters);
            continue;
        }

        const role = await guildRoles.get(databaseRole.roleId);

        roles.push(new Messages.RoleObject(role.name, databaseRole.category));
    }

    const embedContent = Messages.RoleList(roles);
	const embed = new EmbedBuilder()
		.setColor(Messages.embedColor)
		.setTitle(embedContent.title)
		.setDescription(embedContent.text)
        .setAuthor({ name: interaction.member.name, iconURL: interaction.member.avatarURL });

	await interaction.reply({embeds: [embed], ephemeral: false });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("list-roles")
		.setDescription("Lists all registered roles from this server."),

    Execute

};