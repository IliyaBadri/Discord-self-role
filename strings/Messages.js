const embedColor = 0x000000;

class Embed {
    /**
     * @param {string} title 
     * @param {string} text 
     */
    constructor(title, text){
        this.title = title;
        this.text = text;
    }
}

const executionErrorEmbed = new Embed("Internal bot error", "Sorry there was an error while executiong this command.");

const testEmbed = new Embed("Test", "Bot is up and running.");

/**
 * @param {string} permission 
 * @returns {Embed}
 */
function MissingPermission(permission) {
    return new Embed("Access denied", `This action needs **${permission}** permission.`);
}

/**
 * @param {string} category 
 * @returns {Embed}
 */
function CategoryExists(category){
    return new Embed("Error", `Category **${category}** already exists.`);
}

/**
 * @param {string} category 
 * @returns {Embed}
 */
function CategoryDoesNotExists(category){
    return new Embed("Error", `Category **${category}** doesn't exist.`);
}

/**
 * @param {string} category 
 * @param {string} guildName
 * @returns {Embed}
 */
function CategoryCreated(category, guildName){
    return new Embed("Category created", `Successfully created a category:\n> **Category:** ${category}\n> **Guild:** ${guildName}.`);
}

/**
 * @param {string} roleId
 * @returns {Embed}
 */
function RoleAddedToProfile(roleId){
    return new Embed("Role added", `Successfully added a role to your profile:\n> **Role:** <@&${roleId}>`);
}

/**
 * @param {string} roleId
 * @returns {Embed}
 */
function RoleNotAddedToProfile(roleId){
    return new Embed("Error", `Couldn't add the <@&${roleId}> role to your profile.\n**Possible fix:** Make sure the bot has enough permission to access the role you are trying to add to your profile.`);
}

/**
 * @param {string} roleId
 * @returns {Embed}
 */
function RoleDeletedFromProfile(roleId){
    return new Embed("Role deleted", `Successfully deleted a role from your profile:\n> **Role:** <@&${roleId}>`);
}

/**
 * @param {string} roleId
 * @returns {Embed}
 */
function RoleNotDeletedFromProfile(roleId){
    return new Embed("Error", `Couldn't delete the <@&${roleId}> role from your profile.\n**Possible fix:** Make sure the bot has enough permission to access the role you are trying to remove from your profile.`);
}

/**
 * @param {string} category 
 * @param {string} roleId
 * @returns {Embed}
 */
function RoleAlreadyInCategory(category, roleId){
    return new Embed("Error", `The <@&${roleId}> role already exists in the **${category}** category.`);
}

/**
 * @param {string} category 
 * @param {string} roleId
 * @returns {Embed}
 */
function RoleIsNotInCategory(category, roleId){
    return new Embed("Error", `The <@&${roleId}> role does not exist in the **${category}** category.`);
}


/**
 * @param {string} category 
 * @param {string} guildName
 * @param {string} roleId
 * @returns {Embed}
 */
function RoleAdded(category, guildName, roleId){
    return new Embed("Role added", `Successfully added a role to a category:\n> **Role:** <@&${roleId}>\n> **Category:** ${category}\n> **Guild:** ${guildName}.`);
}

/**
 * @param {string} category 
 * @param {string} guildName
 * @param {string} roleId
 * @returns {Embed}
 */
function RoleDeleted(category, guildName, roleId){
    return new Embed("Role deleted", `Successfully deleted a role from a category:\n> **Role:** <@&${roleId}>\n> **Category:** ${category}\n> **Guild:** ${guildName}.`);
}

/**
 * @param {string} category 
 * @param {string} guildName
 * @returns {Embed}
 */
function CategoryDeleted(category, guildName){
    return new Embed("Category deleted", `Successfully deleted a category from the guild:\n> **Category:** ${category}\n> **Guild:** ${guildName}.`);
}

class RoleObject {
    /**
     * @param {string} role 
     * @param {string} category 
     */
    constructor(role, category){
        this.role = role;
        this.category = category;
    }
}

/**
 * @param {Array<RoleObject>} roles 
 * @param {string} guildName
 * @returns {Embed}
 */
function RoleList(roles, guildName){
    let roleListString = "";

    if(roles.length < 1){
        roleListString = "**No roles in this server**";
    }

    let categories = [];

    for(const role of roles){
        if(categories.includes(role.category)){
            continue;
        }

        categories.push(role.category);
    }

    for(const category of categories){
        roleListString += `**${category}** category:\n`;
        for(const role of roles){
            if(role.category !== category){
                continue;
            }

            roleListString += `> <@&${role.role}>\n`;
        }
    }

    return new Embed("Roles in this server", `> **Guild:** ${guildName}.\n\n${roleListString}`);
}

/**
 * @param {string} category 
 * @returns {string}
 */
function CategoryStringOptionDescription(category){
    return `The ( ${category} ) category.`;
}

/**
 * @param {string} roleName 
 * @returns {string}
 */
function RoleStringOptionDescription(roleName){
    return `The @${roleName} role.`;
}

/**
 * @param {string} category 
 * @returns {Embed}
 */
function NoRoleInCategory(category){
    new Embed("Error", `There is no role in the category **${category}**`);
}

const noRoleInProfile = new Embed("Error", "You have not added any selectable roles to your profile.");

/**
 * @param {string} roleId 
 * @returns {Embed}
 */
function InvalidRole(roleId){
    new Embed("Error", `The <@&${roleId}> role is not a valid role.`);
}

const noCategoryInThisGuild = new Embed("Error", "There wasn't any category in this guild.");

const selectCategory = new Embed("Select a category", "Please select a category from the menu.");
const selectRole = new Embed("Select a role", "Please select a role from the menu to add it to your profile.");
const selectRemoveRole = new Embed("Select a role", "Please select a role from the menu to remove it from your profile.");

module.exports = {
    embedColor,
    Embed,
    executionErrorEmbed,
    testEmbed,
    MissingPermission,
    CategoryExists,
    CategoryDoesNotExists,
    CategoryCreated,
    RoleAlreadyInCategory,
    RoleIsNotInCategory,
    RoleAdded,
    RoleDeleted,
    RoleAddedToProfile,
    RoleNotAddedToProfile,
    RoleDeletedFromProfile,
    RoleNotDeletedFromProfile,
    CategoryDeleted,
    RoleObject,
    RoleList,
    CategoryStringOptionDescription,
    RoleStringOptionDescription,
    NoRoleInCategory,
    InvalidRole,
    noRoleInProfile,
    noCategoryInThisGuild,
    selectCategory,
    selectRole,
    selectRemoveRole
}