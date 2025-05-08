import mysql from 'mysql2';

import MySQL from './MySQL.mjs';
import Postgresql from './Postgresql.mjs';

const databases = {
    mysql: MySQL,
    postgresql: Postgresql,
};

if (!IN_PRODUCTION) {
    const sqlite = (await import('./SQLite.mjs')).default;
    databases.sqlite = sqlite;
}
const dbType = await config('app.database.database');
class DatabaseManager {
    static #databaseServer; // <-- now static
    #selectedDB;

    constructor() {
        let databaseType = dbType || 'sqlite';
        this.#selectedDB = databases[databaseType];
        this.init();
    }

    async runQuery(sql = '', params = []) {
        this.init();

        if (dbType === 'postgresql') {
            let paramIndex = 1;
            sql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        }

        const queryTrace = await config('query_trace');
        if (queryTrace) {
            console.log('Query Trace:', this.getQueryTrace(sql, params));
        }

        return await DatabaseManager.#databaseServer.query(sql, params);
    }

    async runQueryNoReturn(sql, params = []) {
        await this.runQuery(sql, params);
    }

    async makeMigration(query, filename, rollback = false) {
        if (rollback) {
            await this.runQuery(`DELETE FROM migrations WHERE migration_name = ?`, [filename]);
            await this.runQuery(query);
            return;
        }

        try {
            const fileNameChecker = await this.runQuery(`SELECT * FROM migrations WHERE migration_name = ?`, [filename]);
            if (fileNameChecker.length === 0) {
                const migrationResult = await this.runQuery(query);
                if (migrationResult) {
                    const inserted = await this.runQuery(`INSERT INTO migrations (migration_name) VALUES (?)`, [filename]);
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

    init() {
        if (!DatabaseManager.#databaseServer) {
            DatabaseManager.#databaseServer = new this.#selectedDB();
        }
    }

    escape(value) {
        this.init();
        return DatabaseManager.#databaseServer.escape(value);
    }

    getQueryTrace(query, params = []) {
        if (dbType !== 'postgresql') {
            return mysql.format(query, params);
        }
        return query.replace(/\$(\d+)/g, (_, index) => {
            const param = params[index - 1];

            if (param === null || param === undefined) return 'NULL';

            if (typeof param === 'string') {
                // escape single quotes
                return `'${param.replace(/'/g, "''")}'`;
            }

            if (param instanceof Date) {
                return `'${param.toISOString()}'`;
            }

            return param;
        });
    }

    async isSchemaNotExist() {
        if (dbType !== 'sqlite') {
            const notExist = await DatabaseManager.#databaseServer.checkSchema();
            if (notExist) {
                return await config(`app.database.${dbType}.database`);
            }
        }
        return false;
    }

    async createSchema() {
        if (dbType !== 'sqlite') {
            const notExist = await DatabaseManager.#databaseServer.checkSchema();
            if (notExist) {
                console.log('Creating schema...');
                const schema = await config(`app.database.${dbType}.database`);
                await DatabaseManager.#databaseServer.createSchema(schema);
                return true;
            }
        }
        return false;
    }

    async close() {
        if (DatabaseManager.#databaseServer?.close) {
            await DatabaseManager.#databaseServer.close();
            DatabaseManager.#databaseServer = null;
        }
        return true;
    }
}

// Handle graceful shutdown
// This will ensure that the database connection is closed when the process exits
let isShuttingDown = false;

const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    const db = new DatabaseManager();
    await db.close();
    console.log('Database connection closed.');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default DatabaseManager;
