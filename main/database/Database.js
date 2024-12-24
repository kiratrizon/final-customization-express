const mysql = require('mysql2');
const sqlite = require('better-sqlite3');
const path = require('path');
const sqlFormatter = require('sql-formatter');
const dbPath = path.join(__dirname, '../database', 'database.sqlite');
const deasync = require('deasync');
const dbtype = env('DATABASE', 'sqlite');
const isSQLite = dbtype === 'sqlite';
const isMySQL = dbtype === 'mysql';
const isPostgresql = dbtype === 'postgresql';

require('dotenv').config();

class Database {
    static #sqliteConnection = null;
    static #mysqlProperty = null;
    static #mysqlConnection = null;
    static #debugger = false;

    constructor() {
        this.#openConnection();
    }

    #openConnection() {
        if (isSQLite && Database.#sqliteConnection === null) {
            Database.#sqliteConnection = new sqlite(dbPath);
        } else if (isMySQL && Database.#mysqlConnection === null) {
            if (Database.#mysqlProperty === null) {
                Database.#mysqlProperty = config('app.database.mysql');
            }
            Database.#mysqlConnection = mysql.createPool(Database.#mysqlProperty);
            Database.#mysqlConnection.getConnection((err) => {
                if (err) {
                    console.error('Error connecting to MySQL database:', err.message);
                }
            });

        }
    }

    async runQuery(query, params = [], logger = true) {
        query = sqlFormatter.format(query);
        const queryType = query.trim().toLowerCase().split(' ')[0].trim();
        let result = null;
        await this.#timeZoneRunner(queryType);
        try {
            if (logger && Database.#debugger) {
                console.log('Query:', query);
                console.log('Params:', params);
            }

            // For SQLite
            if (isSQLite) {
                // run timezone first
                const stmt = Database.#sqliteConnection.prepare(query);
                switch (queryType) {
                    case 'insert': {
                        result = stmt.run(params).lastInsertRowid;
                        break;
                    }
                    case 'update':
                    case 'delete': {
                        result = stmt.run(params).changes > 0;
                        break;
                    }
                    case 'create':
                    case 'alter':
                    case 'drop':
                        stmt.run(params);
                        result = true;  // Success
                        break;
                    case 'select':
                        result = stmt.all(params);
                        break;
                    default:
                        result = stmt.all(params);
                        break;
                }
            } else {
                // For MySQL
                result = await new Promise((resolve, reject) => {
                    Database.#mysqlConnection.query(query, params, (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            switch (queryType) {
                                case 'insert':
                                    resolve(results.insertId);  // Return last inserted ID
                                    break;
                                case 'update':
                                case 'delete':
                                    resolve(results.affectedRows > 0);  // Return true if affected rows > 0
                                    break;
                                case 'create':
                                case 'alter':
                                case 'drop':
                                    resolve(true);  // Return true for successful CREATE and ALTER
                                    break;
                                case 'select':
                                    resolve(results.length > 0 ? results : []);  // Return empty array if no rows are found
                                    break;
                                default:
                                    resolve(results);  // Return the results for SELECT and other queries
                                    break;
                            }
                        }
                    });
                });
            }
            // await this.close();
            return result;
        } catch (err) {
            // console.error('Query Error:', err);
            return null;
        }
    }

    async runQueryNoLogs(query, params = []) {
        return await this.runQuery(query, params, false);
    }
    async close() {
        if (isSQLite && Database.#sqliteConnection != null) {
            Database.#sqliteConnection.close();
            Database.#sqliteConnection = null;
        } else if (isMySQL && Database.#mysqlConnection != null) {
            Database.#mysqlConnection.end(
                (err) => {
                    if (err) {
                        console.error('Error closing the MySQL connection:', err.message);
                    } else {
                        console.log('MySQL connection closed.');
                        Database.#mysqlConnection = null;
                    }
                }
            );
        }
        return true;
    }

    async makeMigration(query, filename, rollback = false) {
        if (rollback) {
            await this.runQueryNoLogs(`DELETE FROM migrations WHERE migration_name = ?`, [filename]);
            await this.runQueryNoLogs(query);
            return;
        }
        try {
            let fileNameChecker = await this.runQueryNoLogs(`SELECT * FROM migrations WHERE migration_name = ?`, [filename]);
            if (fileNameChecker.length === 0) {
                const migrationResult = await this.runQueryNoLogs(query);

                if (migrationResult) {
                    const inserted = await this.runQueryNoLogs(`INSERT INTO migrations (migration_name) VALUES (?)`, [filename]);
                    if (inserted) {
                        console.log(`Migration "${filename}" applied successfully.`);
                        return true;
                    } else {
                        console.log(`Migration "${filename}" was not applied due to an error.`);
                        return false;
                    }
                } else {
                    console.log(`Migration "${filename}" failed to execute.`);
                }
            }
        } catch (err) {
            console.error(`Error applying migration "${filename}":`, err);
        }
        return false;
    }

    async searchPrimaryName(modelName) {
        const tableName = generateTableNames(modelName);
        const databaseProp = config('app.database');
        let string = '';
        if (isSQLite) {
            string = `SELECT name
                        FROM pragma_table_info('${tableName}')
                        WHERE pk = 1;
                    `;
        } else {
            string = `SELECT COLUMN_NAME AS name
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_SCHEMA = '${databaseProp.mysql.database}'
                        AND TABLE_NAME = '${tableName}'
                        AND COLUMN_KEY = 'PRI';
                    `;
        }
        const data = await this.runQueryNoLogs(string);
        if (data.length) {
            return data[0].name;
        }
        return null;
    }

    async runQueryNoReturn(query, params = [], logger = true) {
        await this.runQuery(query, params, logger);
    }

    escape(value) {
        if (isSQLite) {
            if (typeof value === 'string') {
                return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
            }
            if (typeof value === 'boolean') {
                return value ? 1 : 0;
            }
            if (value === null) {
                return 'NULL';
            }
            return value;
        }

        if (isMySQL) {
            if (!Database.#mysqlConnection) {
                this.#openConnection();
            }

            return Database.#mysqlConnection.escape(value);
        }

        return value;
    }

    async #timeZoneRunner(queryType) {
        let timezone = config('app.database.timezone');
        let query;
        const params = [];
        query = `SET time_zone = ?;`;
        params.push(timezone);
        if (isSQLite) return;
        const openTimeZone = [
            'select',
            'insert',
            'update',
            'call',
            'drop'
        ];
        this.#checkConnection();
        if (!openTimeZone.includes(queryType)) return;
        try {
            if (isMySQL) {
                await new Promise((resolve, reject) => {
                    Database.#mysqlConnection.query(query, params, (err, results) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        resolve();
                    });
                });
            }
        } catch (err) {
            console.error('Time Zone Error:', err);
        }
    }

    #checkConnection() {
        if (env('DATABASE') === 'mysql') {
            if (Database.#mysqlConnection === null) {
                this.#openConnection();
            }
        } else if (env('DATABASE') === 'sqlite') {
            if (!Database.#sqliteConnection) {
                this.#openConnection();
            }
        }
    }
}

module.exports = Database;

// exit when application terminated

process.on('SIGINT', async () => {
    console.log('Closing database connections...');
    const database = new Database();
    if ((await database.close())) {
        console.log('Closed...');
        process.exit(0);
    }
});