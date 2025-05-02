const mysql = require('mysql2'); // for query tracing

const databases = {
    "mysql": require('./MySQL'),
    "sqlite": require('./SQLite'),
    "postgresql": require('./Postgresql'),
};

class DatabaseManager {
    static #databaseServer; // <-- now static
    #selectedDB;

    constructor() {
        let databaseType = config('app.database.database') || 'sqlite';
        this.#selectedDB = databases[databaseType];
    }

    async runQuery(sql = '', params = []) {
        this.init();

        if (config('app.database.database') === 'postgresql') {
            let paramIndex = 1;
            sql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        }

        if (config('query_trace')) {
            const tracing = new Error().stack.split('\n').slice(2).map(line => line.trim()).join('\n');
            log(tracing + this.getQueryTrace(sql, params), 'query_trace', 'Query Trace:');
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
        return mysql.format(query, params);
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

module.exports = DatabaseManager;
