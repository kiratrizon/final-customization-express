const fs = require('fs');
const path = require('path');
const DatabaseConnection = require('./Manager/DatabaseManager');

class MigrationRunner {
    constructor() {
        this.migrationsPath = path.join(__dirname, '..', 'database', 'migrations');
        console.log(this.migrationsPath);
        this.db = new DatabaseConnection();
    }

    async run() {
        const migrationFiles = this.getMigrationFiles();

        let count = 0;
        // Use Promise.all to wait for all migrations to complete
        for (let i = 0; i < migrationFiles.length; i++) {
            const file = migrationFiles[i];
            const migrationName = file.replace('.js', '');
            const migrationModule = require(path.join(this.migrationsPath, file));
            const instantiatedMigrationModule = new migrationModule();
            const query = instantiatedMigrationModule.up();

            try {
                // Assuming makeMigration is a method that returns a promise
                const success = await this.db.makeMigration(query, migrationName);
                if (success) {
                    count++;
                }
            } catch (error) {
                console.log(query);
                console.error(`Error processing migration ${migrationName}:`, error);
            }
        }

        // Check the count after all migrations are completed
        if (count === 0) {
            console.log('Nothing to migrate.');
            return;
        }
        console.log(`Migrated ${count} files successfully.`);
    }


    async migrateInit() {
        let migrationsTableQuery = '';
        if (config('app.database.database') === 'mysql') {
            migrationsTableQuery = `
                CREATE TABLE IF NOT EXISTS migrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    migration_name VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
        } else if (config('app.database.database') === 'sqlite') {
            migrationsTableQuery = `
                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    migration_name VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
        }

        await this.db.runQuery(migrationsTableQuery);
    }

    async rollback() {
        const migrationFiles = this.getMigrationFiles();

        migrationFiles.map(async (file) => {
            const migrationName = file.replace('.js', '');
            const migrationModule = require(path.join(this.migrationsPath, file));
            const instantiatedMigrationModule = new migrationModule();
            const query = instantiatedMigrationModule.down();

            await this.db.makeMigration(query, migrationName, true);
        });
        console.log('Rolled back successfully.');

        await this.run();
    }

    async dropAllTables() {
        let sql;
        const params = [];

        if (config('app.database.database') === 'mysql') {
            sql = `SELECT TABLE_NAME AS name
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME != 'migrations'`;
            let schema = config('app.database.mysql.database');
            params.push(schema);
        } else if (config('app.database.database') === 'sqlite') {
            sql = "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'";
        }


        const tables = await this.db.runQuery(sql, params);

        if (!tables.length) {
            console.log('No tables to drop.');
        }

        // Disable foreign key constraints for SQLite
        if (config('app.database.database') === 'sqlite') {
            await this.db.runQuery('PRAGMA foreign_keys = OFF');
        }

        tables.map(async (table) => {
            const dropTableQuery = `DROP TABLE IF EXISTS ${table.name};`;
            await this.db.runQuery(dropTableQuery);
        })

        // Re-enable foreign key constraints for SQLite
        if (config('app.database.database') === 'sqlite') {
            await this.db.runQuery('PRAGMA foreign_keys = ON');
        }

        await this.db.runQuery("DELETE FROM migrations");

        console.log('All tables dropped successfully.');

        await this.run();
    }

    getMigrationFiles() {
        return fs.readdirSync(this.migrationsPath).filter(file => file.endsWith('.js'));
    }
}

module.exports = MigrationRunner;
