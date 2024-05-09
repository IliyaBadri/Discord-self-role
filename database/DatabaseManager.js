const DatabaseModule = require("./Database.js");

/**
 * @param {string} guildId 
 * @param {string} category 
 * @returns {boolean}
 */
async function IsCategory(guildId, category){
    const selectExsitingCategoryQuery = "SELECT * FROM categories WHERE guildId = ? AND category = ?"; 
    const selectExsitingCategoryQueryParameters = [guildId, category];
    const existingCategories = await DatabaseModule.GetGetAllPromise(selectExsitingCategoryQuery, selectExsitingCategoryQueryParameters);

    return (existingCategories.length > 0);
}

/**
 * @param {string} guildId 
 * @param {string} category 
 * @param {string} roleId
 * @returns {boolean}
 */
async function IsRole(guildId, category, roleId){
    const selectExsitingRoleQuery = "SELECT * FROM roles WHERE guildId = ? AND category = ? AND roleId = ?"; 
    const selectExsitingRoleQueryParameters = [guildId, category, roleId];
    const existingCategories = await DatabaseModule.GetGetAllPromise(selectExsitingRoleQuery, selectExsitingRoleQueryParameters);

    return (existingCategories.length > 0);
}

module.exports = {
    IsCategory,
    IsRole
}