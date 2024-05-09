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
 * @param {string} roleName
 * @returns {Embed}
 */
function RoleAlreadyInCategory(category, roleName){
    return new Embed("Error", `The **${roleName}** role already exists in the **${category}** category.`);
}

/**
 * @param {string} category 
 * @param {string} guildName
 * @param {string} roleName
 * @returns {Embed}
 */
function CategoryCreated(category, guildName, roleName){
    return new Embed("Role added", `Successfully added a role to a category:\n> **Role:** ${roleName}\n> **Category:** ${category}\n> **Guild:** ${guildName}.`);
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
    RoleAlreadyInCategory
}