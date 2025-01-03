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

    runQuery(query, params = [], logger = true) {
        query = sqlFormatter.format(query);
        const queryType = query.trim().toLowerCase().split(' ')[0].trim();
        let result = null;

        // Run time zone adjustment first
        this.#timeZoneRunner(queryType);

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
                // For MySQL (synchronous-like behavior)
                let data = null;

                // Execute the MySQL query with a callback
                Database.#mysqlConnection.query(query, params, (err, results) => {
                    if (err) {
                        console.log('MySQL Query Error:', err);
                        data = false; // Set data to false if there's an error
                    } else {
                        switch (queryType) {
                            case 'insert':
                                data = results.insertId;  // Return last inserted ID
                                break;
                            case 'update':
                            case 'delete':
                                data = results.affectedRows > 0;  // Return true if affected rows > 0
                                break;
                            case 'create':
                            case 'alter':
                            case 'drop':
                                data = true;  // Success for CREATE, ALTER, DROP
                                break;
                            case 'select':
                                data = results.length > 0 ? results : [];  // Return empty array if no rows
                                break;
                            default:
                                data = results;  // For other types of queries
                                break;
                        }
                    }
                });

                // Polling until data is set (blocking with deasync)
                while (data === null) {
                    deasync.sleep(100);  // Block the loop for 100ms
                }

                result = data;  // Set the final result once it's ready
            }

            // Return the result (or false in case of error)
            return result;
        } catch (err) {
            console.error('Query Error:', err);
            return false;
        }
    }

    runQueryNoLogs(query, params = []) {
        return this.runQuery(query, params, false);
    }
    close() {
        if (isSQLite && Database.#sqliteConnection != null) {
            Database.#sqliteConnection.close();
            Database.#sqliteConnection = null;
        } else if (isMySQL && Database.#mysqlConnection != null) {
            let isClosed = false;

            // Use deasync to make the MySQL connection close synchronously
            Database.#mysqlConnection.end((err) => {
                if (err) {
                    console.error('Error closing the MySQL connection:', err.message);
                } else {
                    // console.log('MySQL connection closed.');
                }
                Database.#mysqlConnection = null;
                isClosed = true; // Mark the connection as closed
            });

            // Block until the MySQL connection is closed
            while (!isClosed) {
                deasync.sleep(100); // Sleep for 100ms and retry
            }
        }
        return true;
    }

    makeMigration(query, filename, rollback = false) {
        if (rollback) {
            this.runQueryNoLogs(`DELETE FROM migrations WHERE migration_name = ?`, [filename]);
            this.runQueryNoLogs(query);
            return;
        }
        try {
            let fileNameChecker = this.runQueryNoLogs(`SELECT * FROM migrations WHERE migration_name = ?`, [filename]);
            if (fileNameChecker.length === 0) {
                const migrationResult = this.runQueryNoLogs(query);

                if (migrationResult) {
                    const inserted = this.runQueryNoLogs(`INSERT INTO migrations (migration_name) VALUES (?)`, [filename]);
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

    searchPrimaryName(modelName) {
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
        const data = this.runQueryNoLogs(string);
        if (data.length) {
            return data[0].name;
        }
        return null;
    }

    runQueryNoReturn(query, params = [], logger = true) {
        this.runQuery(query, params, logger);
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

    #timeZoneRunner(queryType) {
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
                let data = null; // Initialize data to null

                // Query MySQL with a callback, and block until the query completes
                Database.#mysqlConnection.query(query, params, (err, results) => {
                    if (err) {
                        console.log(err);
                        data = false; // Set data to false on error
                    } else {
                        data = true; // Set data to true on success
                    }
                });

                // Poll until data is set (blocking with deasync)
                while (data === null) {
                    deasync.sleep(100); // Block for 100ms until the callback updates data
                }

                // Proceed once data is set (this simulates synchronous behavior)
                if (data === false) {
                    console.error('Time Zone Error: Query failed');
                }

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

process.on('SIGINT', async () => {
    console.log('Closing database connections...');
    const database = new Database();
    if ((database.close())) {
        console.log('Closed...');
        process.exit(0);
    }
});