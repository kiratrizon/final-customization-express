const mysql = require('mysql2');
const sqlite = require('better-sqlite3');
const path = require('path');
const sqlFormatter = require('sql-formatter');
require('dotenv').config();

class Database {
    constructor() {
        this.debugger = (process.env.DEBUGGER || 'false') === 'true';
        this.connection = null;
    }

    openConnection() {
        const isSQLite = process.env.DATABASE === 'sqlite';

        if (!this.connection) {
            if (isSQLite) {
                const dbPath = path.join(__dirname, '../database', 'database.sqlite');
                this.connection = new sqlite(dbPath);
            } else {
                this.connection = mysql.createConnection({
                    host: process.env.MYSQL_HOST || 'localhost',
                    user: process.env.MYSQL_USER || 'root',
                    password: process.env.MYSQL_PASSWORD || '',
                    database: process.env.MYSQL_DB || 'express',
                    port: process.env.MYSQL_PORT || 3306
                });

                this.connection.connect((err) => {
                    if (err) {
                        console.error('Error connecting to MySQL database:', err.message);
                        this.connection = null;
                    }
                });
            }
        }
    }

    async runQuery(query, params = []) {
        const isSQLite = process.env.DATABASE === 'sqlite';
        query = sqlFormatter.format(query);

        let result;
        try {
            // Open the connection at the start of the method
            this.openConnection();

            if (this.debugger) {
                console.log('Query:', query);
                console.log('Params:', params);
            }

            if (!this.connection) {
                throw new Error('Database connection is not established.');
            }

            // For SQLite
            if (isSQLite) {
                const stmt = this.connection.prepare(query);
                const queryType = query.trim().toLowerCase().split(' ')[0];

                switch (queryType.trim()) {
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
            return result;
        } catch (err) {
            console.error('Query Error:', err);
            return false;  // Return false if there is an error
        } finally {
            // Ensure the connection is closed after the query has completed (successful or not)
        }
    }

    async runQueryNoLogs(query, params = []) {
        const isSQLite = process.env.DATABASE === 'sqlite';
        query = sqlFormatter.format(query);

        let result;
        try {
            // Open the connection at the start of the method
            this.openConnection();

            if (!this.connection) {
                throw new Error('Database connection is not established.');
            }

            // For SQLite
            if (isSQLite) {
                const stmt = this.connection.prepare(query);
                const queryType = query.trim().toLowerCase().split(' ')[0];

                switch (queryType.trim()) {
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
            return result;
        } catch (err) {
            console.error('Query Error:', err);
            return false;  // Return false if there is an error
        } finally {
            // Ensure the connection is closed after the query has completed (successful or not)
        }
    }
    async close() {
        if (!this.connection) return;

        if (process.env.DATABASE === 'sqlite') {
            this.connection.close();
        } else {
            this.connection.end((err) => {
                if (err) {
                    console.error('Error closing the MySQL connection:', err.message);
                }
            });
        }

        this.connection = null;
    }

    async makeMigration(query, filename, rollback = false) {
        let migrationsTableQuery = '';
        if (rollback) {
            await this.runQueryNoLogs(`DELETE FROM migrations WHERE migration_name = ?`, [filename]);
            await this.runQueryNoLogs(query);
        } else {
            if (process.env.DATABASE === 'mysql') {
                migrationsTableQuery = `
                    CREATE TABLE IF NOT EXISTS migrations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        migration_name VARCHAR(255) NOT NULL UNIQUE,
                        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `;
            } else if (process.env.DATABASE === 'sqlite') {
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
                    } else {
                        console.log(`Migration "${filename}" failed to execute.`);
                    }
                }
            } catch (err) {
                console.error(`Error applying migration "${filename}":`, err);
            }
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
