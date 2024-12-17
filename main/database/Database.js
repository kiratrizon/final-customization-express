const mysql = require('mysql2');
const sqlite = require('better-sqlite3');
const path = require('path');
const sqlFormatter = require('sql-formatter');
const Carbon = require('../../libraries/Materials/Carbon');
require('dotenv').config();

class Database {
    constructor() {
        this.debugger = (env('DEBUGGER') || 'false') === 'true';
        this.connection = null;
        this.mysqlProperty = config('app.database.mysql');
    }

    openConnection() {
        const isSQLite = env('DATABASE') === 'sqlite';

        if (!this.connection) {
            if (isSQLite) {
                const dbPath = path.join(__dirname, '../database', 'database.sqlite');
                this.connection = new sqlite(dbPath);
            } else {
                this.connection = mysql.createConnection(this.mysqlProperty);

                this.connection.connect((err) => {
                    if (err) {
                        console.error('Error connecting to MySQL database:', err.message);
                        this.connection = null;
                    }
                });
            }
        }
    }

    async runQuery(query, params = [], logger = true) {
        const isSQLite = env('DATABASE') === 'sqlite';
        query = sqlFormatter.format(query);
        const queryType = query.trim().toLowerCase().split(' ')[0].trim();
        let result;
        try {
            // Open the connection at the start of the method
            this.openConnection();

            if (logger && this.debugger) {
                console.log('Query:', query);
                console.log('Params:', params);
            }

            if (!this.connection) {
                throw new Error('Database connection is not established.');
            }

            params = this.#replaceNowWithDateTime(params);
            // For SQLite
            if (isSQLite) {
                const stmt = this.connection.prepare(query);
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
                    this.connection.query(query, params, (err, results) => {
                        if (err) {
                            reject(err);
                        } else {
                            const queryType = query.trim().toLowerCase().split(' ')[0];

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
            if (this.connection) {
                await this.close();
            }
            if (queryType === 'select') {
                result.forEach((queried) => {
                    if (queried.created_at) queried.created_at = new Date(queried.created_at).toISOString().slice(0, 19).replace("T", " ");
                    if (queried.updated_at) queried.updated_at = new Date(queried.updated_at).toISOString().slice(0, 19).replace("T", " ");
                })
            }
            return result;
        } catch (err) {
            console.error('Query Error:', err);
            return false;  // Return false if there is an error
        } finally {
            // Ensure the connection is closed after the query has completed (successful or not)
        }
    }

    async runQueryNoLogs(query, params = []) {
        return await this.runQuery(query, params, false);
    }
    async close() {
        if (!this.connection) return;

        if (env('DATABASE') === 'sqlite') {
            this.connection.close();
        } else {
            this.connection.end((err) => {
                if (err) {
                    console.error('Error closing the MySQL connection:', err.message);
                }
            });
        }

        this.connection = null;
        return;
    }

    #replaceNowWithDateTime(arr) {
        const now = Carbon.getDateTime();
        arr.forEach((value, index) => {
            if (Array.isArray(arr[index])) {
                this.#replaceNowWithDateTime(arr[index]);
            } else if (typeof value === 'string' && value.trim().toLowerCase() == 'now()') {
                arr[index] = now;
            }
        });
        return arr;
    }

    async makeMigration(query, filename, rollback = false) {
        let migrationsTableQuery = '';
        if (rollback) {
            await this.runQueryNoLogs(`DELETE FROM migrations WHERE migration_name = ?`, [filename]);
            await this.runQueryNoLogs(query);
        } else {
            if (env('DATABASE') === 'mysql') {
                migrationsTableQuery = `
                    CREATE TABLE IF NOT EXISTS migrations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        migration_name VARCHAR(255) NOT NULL UNIQUE,
                        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `;
            } else if (env('DATABASE') === 'sqlite') {
                migrationsTableQuery = `
                    CREATE TABLE IF NOT EXISTS migrations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        migration_name VARCHAR(255) NOT NULL UNIQUE,
                        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `;
            }

            try {
                await this.runQueryNoLogs(migrationsTableQuery);

                let fileNameChecker = await this.runQueryNoLogs(`SELECT * FROM migrations WHERE migration_name = ?`, [filename]);
                if (fileNameChecker.length === 0) {
                    const migrationResult = await this.runQueryNoLogs(query);

                    if (migrationResult) {
                        await this.runQueryNoLogs(`INSERT INTO migrations (migration_name) VALUES (?)`, [filename]);
                        console.log(`Migration "${filename}" applied successfully.`);
                        return true;

                    } else {
                        console.log(`Migration "${filename}" failed to execute.`);
                    }
                }
            } catch (err) {
                console.error(`Error applying migration "${filename}":`, err);
            }
            return false;
        }
    }

    async searchPrimaryName(modelName) {
        const tableName = generateTableNames(modelName);
        const databaseProp = config('app.database');
        const isSqlite = databaseProp.type == 'sqlite';
        let string = '';
        if (isSqlite) {
            string = `SELECT name
                        FROM pragma_table_info('${tableName}')
                        WHERE pk = 1;
                    `;
        } else {
            string = `SELECT COLUMN_NAME
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_SCHEMA = '${databaseProp.mysql.database}'
                        AND TABLE_NAME = '${tableName}'
                        AND COLUMN_KEY = 'PRI';
                    `;
        }
        try {
            this.debugger = false;
            return await this.runQuery(string);
        } catch (e) {

        } finally {
            this.debugger = env('DEBUGGER');
        }
    }
}

module.exports = Database;
