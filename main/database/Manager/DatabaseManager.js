const { loopWhile } = require('deasync');
const ExternalQuery = require('./ExternalQuery');

let allowedDatabases = ['mysql', 'sqlite'];
const databases = {
    "mysql": require('./MySQL'),
    "sqlite": require('./SQLite'),
};

class DatabaseManager {

    #selectedDB;
    #databaseServer;
    constructor() {
        let databaseType = config('app.database.type');
        if (!allowedDatabases.includes(databaseType)) {
            databaseType = 'sqlite';
        }
        this.#selectedDB = databases[databaseType];
    }

    runQuery(sql, params = []) {
        // init DB
        this.init();
        let done = false;
        let data = null;
        // get query
        this.#databaseServer.query(sql, params).then((result) => {
            data = result;
            done = true;
        }).catch((error) => {
            console.log('Database Error:', error);
            done = true;
        });
        loopWhile(() => !done, 100);
        // return data
        return data;
    }

    runQueryNoReturn(sql, params = []) {
        this.runQuery(sql, params);
    }

    makeMigration(query, filename, rollback = false) {
        if (rollback) {
            this.runQuery(`DELETE FROM migrations WHERE migration_name = ?`, [filename]);
            this.runQuery(query);
            return;
        }
        try {
            let fileNameChecker = this.runQuery(`SELECT * FROM migrations WHERE migration_name = ?`, [filename]);
            if (fileNameChecker.length === 0) {
                const migrationResult = this.runQuery(query);

                if (migrationResult) {
                    const inserted = this.runQuery(`INSERT INTO migrations (migration_name) VALUES (?)`, [filename]);
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

    searchPrimaryName(modelName) {
        const string = ExternalQuery.queryGetPrimaryName(modelName);
        const data = this.runQuery(string);
        if (data.length) {
            return data[0].name;
        }
        return null;
    }

    escape(value) {
        this.init();
        return this.#databaseServer.escape(value);
    }
}

module.exports = DatabaseManager;