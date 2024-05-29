const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, Interaction } = require("discord.js");
const Messages = require("../../strings/Messages.js");
const ConsoleLogs = require("../../strings/ConsoleLogs.js");
const DatabaseModule = require("../../database/Database.js");
const DatabaseManager = require("../../database/DatabaseManager.js");

/**
 * @param {Interaction} interaction 
 * @param {Interaction} rootInteraction 
 */
async function HandleResponseCollectorInteractions(interaction, rootInteraction){
    if(interaction.customId !== "role-selector"){
        return;
    }

    const base64RoleSelection = interaction.values[0];
    const roleSelection = Buffer.from(base64RoleSelection, "base64").toString("ascii");

    await rootInteraction.editReply({ components: [] });
    await interaction.deferUpdate();

    const guildRoles = await interaction.guild.roles.fetch();

    const roleExists = await guildRoles.has(roleSelection);

    const userHasRole = await interaction.member.roles.cache.has(roleSelection);

    if(!roleExists || !userHasRole){
        const errorContent = Messages.InvalidRole(roleSelection);
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await rootInteraction.editReply({embeds: [errorEmbed]});
        return;
    }

    try{
        const role = await guildRoles.get(roleSelection);

        await interaction.member.roles.remove(role);

        const embedContent = Messages.RoleDeletedFromProfile(roleSelection);
        const successEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(embedContent.title)
            .setDescription(embedContent.text);

        await rootInteraction.editReply({
            embeds: [successEmbed]
        });
    } catch {
        const errorContent = Messages.RoleNotDeletedFromProfile(roleSelection);
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await rootInteraction.editReply({
            embeds: [errorEmbed]
        });
    }
}

/**
 * @param {Interaction} interaction 
 */
async function Execute(interaction) {
    const selectGuildRolesQuery = "SELECT * FROM roles WHERE guildId = ?";
    const selectGuildRolesQueryParameters = [interaction.guild.id];
    const databaseRoles = await DatabaseModule.GetGetAllPromise(selectGuildRolesQuery, selectGuildRolesQueryParameters);

    const guildRoles = await interaction.guild.roles.fetch();

    let deletableRoles = [];

    for(const databaseRole of databaseRoles){
        const userHasRole = await interaction.member.roles.cache.has(databaseRole.roleId);
        const guildHasRole = await guildRoles.has(databaseRole.roleId);
        if(!userHasRole || !guildHasRole){
            continue;
        }

        const role = await guildRoles.get(databaseRole.roleId);

        const base64RoleId = Buffer.from(role.id).toString("base64");
        const roleDescription = Messages.RoleStringOptionDescription(role.name);
        const roleOption = new StringSelectMenuOptionBuilder()
            .setLabel(`@${role.name}`)
            .setDescription(roleDescription)
            .setValue(base64RoleId);

        deletableRoles.push(roleOption);
    }

    if(deletableRoles.length < 1){
        const errorContent = Messages.noRoleInProfile;
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await rootInteraction.editReply({embeds: [errorEmbed]});
        return;
    }

    const roleSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("role-selector")
        .addOptions(deletableRoles);
            
    const roleSelectionActionRow = new ActionRowBuilder()
        .addComponents(roleSelectMenu);

    const roleEmbedContent = Messages.selectRemoveRole;
    const roleSelectionEmbed = new EmbedBuilder()
        .setColor(Messages.embedColor)
        .setTitle(roleEmbedContent.title)
        .setDescription(roleEmbedContent.text);

    const response = await interaction.reply({
        embeds: [roleSelectionEmbed],
        components: [roleSelectionActionRow],
        ephemeral: true
    });
    
    const responseCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
    responseCollector.on("collect", (responseInteraction) => {
        HandleResponseCollectorInteractions(responseInteraction, interaction);
    });    
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove-role")
		.setDescription("Lets you remove a selectable role from yourself."),
    Execute
};