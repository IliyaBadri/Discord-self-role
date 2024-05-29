const sqlite3 = require('sqlite3');
const path = require('path');

const databaseDirectory = __dirname;

/**
 * @returns {sqlite3.Database}
 */
function GetDatabase(){
    const database = new sqlite3.Database(path.join(databaseDirectory, "database.db"));
    return database;
}

/**
 * @param {string} query
 * @param {Array} parameters
 * @returns {Promise}
 */
function GetSerializedRunnerPromise(query, parameters) {
    return new Promise((resolve, reject) => {
        const database = GetDatabase();
        database.serialize(() => {
            database.run(query, parameters, (error) => {
                if(error){
                    reject();
                } else {
                    resolve();
                }
                database.close();
            });
        });
    });
}

/**
 * @param {string} query
 * @param {Array} parameters
 * @returns {Promise}
 */
function GetRunnerPromise(query, parameters) {
    return new Promise((resolve, reject) => {
        const database = GetDatabase();
        database.run(query, parameters, (error) => {
            if(error){
                reject();
            } else {
                resolve();
            }
            database.close();
        });
    });
}

/**
 * @param {string} query
 * @param {Array} parameters
 * @returns {Promise}
 */
function GetStatementPromise(query, ...parameters) {
    return new Promise((resolve, reject) => {
        const database = GetDatabase();
        database.serialize(() => {
            const statement = database.prepare(query, (error) => {
                if(error){
                    reject();
                    database.close();
                } else {
                    statement.run(...parameters, (error) => {
                        if(error){
                            reject();
                        } else {
                            resolve();
                        }
                        database.close();
                    });
                }
            });
        });
    });
}

/**
 * @param {string} query
 * @param {Array} parameters
 * @returns {Promise<Array>}
 */
function GetGetAllPromise(query, parameters) {
    return new Promise((resolve, reject) => {
        const database = GetDatabase();
        database.all(query, parameters, (error, rows) => {
            if(error){
                reject([]);
            } else {
                resolve(rows);
            }
            database.close();
        });
    });
}

async function SetupDatabase(){
    const setupQueries = [
        "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, guildId TEXT, category TEXT)",
        "CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY, guildId TEXT, category TEXT, roleId TEXT)"
    ];

    for(const query of setupQueries){
        await GetSerializedRunnerPromise(query, []);
    }
}

module.exports = {
    GetDatabase,
    SetupDatabase,
    GetGetAllPromise,
    GetStatementPromise,
    GetRunnerPromise,
    GetSerializedRunnerPromise
}
