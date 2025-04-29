const mysql = require('mysql2'); // for query tracing

let allowedDatabases = ['mysql', 'sqlite'];
const databases = {
    "mysql": require('./MySQL'),
    "sqlite": require('./SQLite'),
    "postgresql": require('./Postgresql'),
};

class DatabaseManager {

    #selectedDB;
    #databaseServer;
    constructor() {
        let databaseType = config('app.database.database') || 'sqlite';
        this.#selectedDB = databases[databaseType];
    }

    // This is for artisan/CLI usage only — not for HTTP requests
    async runQuery(sql = '', params = []) {
        this.init(); // init DB

        if (config('app.database.database') === 'postgresql') {
            // replace all '?' with $1 $2 $3 ...
            // count first if how many '?' are in the sql
            let paramIndex = 1;
            sql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        }
        if (config('query_trace')) {
            // console.log(sql, params);
            const tracing = new Error().stack.split('\n').slice(2).map(line => line.trim()).join('\n');
            log(tracing + this.getQueryTrace(sql, params), 'query_trace', 'Query Trace:');
        }
        let data = await this.#databaseServer.query(sql, params);

        return data;
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
            let fileNameChecker = await this.runQuery(`SELECT * FROM migrations WHERE migration_name = ?`, [filename]);
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
        if (!this.#databaseServer) {
            this.#databaseServer = new this.#selectedDB();
        }
    }

    escape(value) {
        this.init();
        return this.#databaseServer.escape(value);
    }

    getQueryTrace(query, params = []) {
        return mysql.format(query, params);
    }
}

module.exports = DatabaseManager;