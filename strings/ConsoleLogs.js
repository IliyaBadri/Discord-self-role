
/**
 * @param {string} argument 
 * @param {string} modulePath 
 * @returns {string}
 */
function NoArgumentInModule(argument, modulePath){
    return `[WARNING] The module at ( ${modulePath} ) is missing the ( ${argument} ) property.`;
}

/**
 * @param {string} argument 
 * @param {string} requiredType
 * @param {string} modulePath 
 * @returns {string}
 */
function WrongArgumentTypeInModule(argument, requiredType, modulePath){
    return `[WARNING] The ( ${argument} ) property in the ( ${modulePath} ) module must be of type ( ${requiredType} ).`;
}

/**
 * @param {string} error 
 * @param {string} modulePath 
 * @returns {string}
 */
function CatchedErrorInModule(error, modulePath){
    return `[ERROR:CATCHED] ( ${modulePath} ): ${error}.`;
}

/**
 * @param {string} clientName 
 * @returns {string}
 */
function ClientLoggedIn(clientName){
    return `[EVENT] Logged into discord API as ${clientName}`;
}

/**
 * @param {string} commandName
 * @returns {string}
 */
function InvalidCommandRecievedFromDisocrdApi(commandName){
    return `[ERROR:SEVERE:CATCHED] Recieved a command named ( ${commandName} ) which wasn't available in the local commands pool. Please restart the bot to update the commands with the Discord API.`;
}

module.exports = {
    NoArgumentInModule,
    WrongArgumentTypeInModule,
    CatchedErrorInModule,
    ClientLoggedIn,
    InvalidCommandRecievedFromDisocrdApi
};