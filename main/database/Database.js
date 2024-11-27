const mysql = require('mysql2');
const sqlite = require('better-sqlite3');
const path = require('path');
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
    
        try {
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
    
                switch (queryType) {
                    case 'insert': {
                        const result = stmt.run(params);
                        return result.lastInsertRowid;
                    }
                    case 'update':
                    case 'delete': {
                        const result = stmt.run(params);
                        return result.changes > 0;
                    }
                    case 'create':
                    case 'alter':
                    case 'drop':
                        // For CREATE and ALTER queries, return true if no error occurred
                        stmt.run(params);
                        return true;  // Success
                    case 'select':
                        return stmt.all(params);
                    default:
                        stmt.all(params)
                        return true;  // Default for SELECT and other queries
                }
            } else {
                // For MySQL
                return new Promise((resolve, reject) => {
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
                                default:
                                    resolve(results);  // Return the results for SELECT and other queries
                                    break;
                            }
                        }
                    });
                });
            }
        } catch (err) {
            console.error('Query Error:', err);
            return false;  // Return false if there is an error
        } finally {
            await this.close();
        }
    }
    async close() {
        if (!this.connection) return;

        if (process.env.DATABASE === 'sqlite') {
            this.connection.close();
        } else {
            await new Promise((resolve, reject) => {
                this.connection.end((err) => {
                    if (err) {
                        console.error('Error closing the MySQL connection:', err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }

        this.connection = null;
    }

    async makeMigration(query, filename, rollback = false) {
        let migrationsTableQuery = '';
        if (rollback){
            await this.#privateRunQuery(`DELETE FROM migrations WHERE migration_name = ?`, [filename]);
            await this.#privateRunQuery(query);
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
                await this.#privateRunQuery(migrationsTableQuery);
        
                let fileNameChecker = await this.#privateRunQuery(`SELECT * FROM migrations WHERE migration_name = ?`, [filename]);
                if (fileNameChecker.length === 0) {
                    const migrationResult = await this.#privateRunQuery(query);
                    
                    if (migrationResult) {
                        await this.#privateRunQuery(`INSERT INTO migrations (migration_name) VALUES (?)`, [filename]);
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

    async #privateRunQuery(query, params = []) {
        const isSQLite = process.env.DATABASE === 'sqlite';
    
        try {
            this.openConnection();
    
            if (!this.connection) {
                throw new Error('Database connection is not established.');
            }
    
            // For SQLite
            if (isSQLite) {
                const stmt = this.connection.prepare(query);
                const queryType = query.trim().toLowerCase().split(' ')[0];
    
                switch (queryType) {
                    case 'insert': {
                        const result = stmt.run(params);
                        return result.lastInsertRowid;
                    }
                    case 'update':
                    case 'delete': {
                        const result = stmt.run(params);
                        return result.changes > 0;
                    }
                    case 'create':
                    case 'alter':
                    case 'drop':
                        // For CREATE and ALTER queries, return true if no error occurred
                        stmt.run(params);
                        return true;  // Success
                    case 'select':
                        return stmt.all(params);
                    default:
                        return stmt.all(params)
                }
            } else {
                // For MySQL
                return new Promise((resolve, reject) => {
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
                                default:
                                    resolve(results);  // Return the results for SELECT and other queries
                                    break;
                            }
                        }
                    });
                });
            }
        } catch (err) {
            console.error('Query Error:', err);
            return false;  // Return false if there is an error
        } finally {
            await this.close();
        }
    }
}

module.exports = Database;
