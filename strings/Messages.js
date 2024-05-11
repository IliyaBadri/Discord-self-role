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
 * @returns {Embed}
 */
function RoleList(roles){
    if(roles.length < 1){
        return "**No roles in this server**";
    }

    let roleListString = "";

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

    return new Embed("Roles in this server", `> **Guild:** ${guildName}.\n${roleListString}`);
}



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
    CategoryDeleted,
    RoleObject,
    RoleList
}