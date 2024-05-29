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
    const guildRoles = await interaction.guild.roles.fetch();
    switch(interaction.customId){
        case "category-selector":
            const base64CategorySelection = interaction.values[0];
            const categorySelection = Buffer.from(base64CategorySelection, "base64").toString("ascii");

            await rootInteraction.editReply({ components: [] });
            await interaction.deferUpdate();

            const isCategory = await DatabaseManager.IsCategory(interaction.guild.id, categorySelection);
            if(!isCategory){
                const errorContent = Messages.CategoryDoesNotExists(categorySelection);
                const errorEmbed = new EmbedBuilder()
                    .setColor(Messages.embedColor)
                    .setTitle(errorContent.title)
                    .setDescription(errorContent.text);

                await rootInteraction.editReply({embeds: [errorEmbed]});
                return;
            }

            const selectCategoryRolesQuery = "SELECT * FROM roles WHERE guildId = ? AND category = ?";
            const selectCategoryRolesQueryParameters = [interaction.guild.id, categorySelection];
            const databaseCategoryRoles = await DatabaseModule.GetGetAllPromise(selectCategoryRolesQuery, selectCategoryRolesQueryParameters);

            let roleOptions = [];

            for(const databaseCategoryRole of databaseCategoryRoles){

                const roleExists = await guildRoles.has(databaseCategoryRole.roleId);

                if(!roleExists){
                    const deleteRoleQuery = "DELETE FROM roles WHERE id = ?";
                    const deleteRoleQueryParameters = [databaseCategoryRole.id];
                    await DatabaseModule.GetRunnerPromise(deleteRoleQuery, deleteRoleQueryParameters);
                    continue;
                }

                const role = await guildRoles.get(databaseCategoryRole.roleId);
                const base64RoleId = Buffer.from(databaseCategoryRole.roleId).toString("base64");
                const roleDescription = Messages.RoleStringOptionDescription(role.name);
                const roleOption = new StringSelectMenuOptionBuilder()
                    .setLabel(`@${role.name}`)
                    .setDescription(roleDescription)
                    .setValue(base64RoleId);
                
                roleOptions.push(roleOption);
            }

            if(roleOptions.length < 1){
                const errorContent = Messages.NoRoleInCategory(categorySelection);
                const errorEmbed = new EmbedBuilder()
                    .setColor(Messages.embedColor)
                    .setTitle(errorContent.title)
                    .setDescription(errorContent.text);
        
                await rootInteraction.editReply({embeds: [errorEmbed]});
                return;
            }

            const roleSelectMenu = new StringSelectMenuBuilder()
                .setCustomId("role-selector")
                .addOptions(roleOptions);
            
            const roleSelectionActionRow = new ActionRowBuilder()
                .addComponents(roleSelectMenu);

            const roleEmbedContent = Messages.selectRole;
            const roleSelectionEmbed = new EmbedBuilder()
                .setColor(Messages.embedColor)
                .setTitle(roleEmbedContent.title)
                .setDescription(roleEmbedContent.text);

            try{
                await rootInteraction.editReply({
                    embeds: [roleSelectionEmbed],
                    components: [roleSelectionActionRow]
                });
            } catch (error) {
                console.log(ConsoleLogs.CatchedErrorInModule(error, `Editing role embed`));
            }
            break;

        case "role-selector":
            const base64RoleSelection = interaction.values[0];
            const roleSelection = Buffer.from(base64RoleSelection, "base64").toString("ascii");

            await rootInteraction.editReply({ components: [] });
            await interaction.deferUpdate();

            const roleExists = await guildRoles.has(roleSelection);

            if(!roleExists){
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
                await interaction.member.roles.add(role);

                const embedContent = Messages.RoleAddedToProfile(roleSelection);
                const successEmbed = new EmbedBuilder()
                    .setColor(Messages.embedColor)
                    .setTitle(embedContent.title)
                    .setDescription(embedContent.text);

                await rootInteraction.editReply({
                    embeds: [successEmbed]
                });
            } catch {
                const errorContent = Messages.RoleNotAddedToProfile(roleSelection);
                const errorEmbed = new EmbedBuilder()
                    .setColor(Messages.embedColor)
                    .setTitle(errorContent.title)
                    .setDescription(errorContent.text);
        
                await rootInteraction.editReply({embeds: [errorEmbed]});
            }

            break;
    }
}

/**
 * @param {Interaction} interaction 
 */
async function Execute(interaction){

    const selectGuildCategoriesQuery = "SELECT * FROM categories WHERE guildId = ?";
    const selectGuildCategoriesQueryParameters = [interaction.guild.id];
    const databaseCategories = await DatabaseModule.GetGetAllPromise(selectGuildCategoriesQuery, selectGuildCategoriesQueryParameters);

    if(databaseCategories.length < 1){
        const errorContent = Messages.noCategoryInThisGuild;
        const errorEmbed = new EmbedBuilder()
            .setColor(Messages.embedColor)
            .setTitle(errorContent.title)
            .setDescription(errorContent.text);

        await interaction.reply({embeds: [errorEmbed], ephemeral: true });
        return;
    }

    let categoryOptions = [];

    for(const databaseCategory of databaseCategories){
        const base64CategoryName = Buffer.from(databaseCategory.category).toString("base64");
        const categoryDescription = Messages.CategoryStringOptionDescription(databaseCategory.category);
        const categoryOption = new StringSelectMenuOptionBuilder()
            .setLabel(databaseCategory.category)
            .setDescription(categoryDescription)
            .setValue(base64CategoryName);
        
        categoryOptions.push(categoryOption);
    }

    const categorySelectMenu = new StringSelectMenuBuilder()
        .setCustomId("category-selector")
        .addOptions(categoryOptions);
    
    const categorySelectionActionRow = new ActionRowBuilder()
        .addComponents(categorySelectMenu);

    const embedContent = Messages.selectCategory;
    const categorySelectionEmbed = new EmbedBuilder()
        .setColor(Messages.embedColor)
        .setTitle(embedContent.title)
        .setDescription(embedContent.text);

    const response = await interaction.reply({
        embeds: [categorySelectionEmbed],
        components: [categorySelectionActionRow],
        ephemeral: true
    });

    const responseCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
    responseCollector.on("collect", (responseInteraction) => {
        HandleResponseCollectorInteractions(responseInteraction, interaction);
    });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("role")
		.setDescription("Lets you add a selectable role to yourself."),
    Execute
};