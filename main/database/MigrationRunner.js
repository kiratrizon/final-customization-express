const fs = require('fs');
const path = require('path');
const DatabaseConnection = require('./Database');

class MigrationRunner {
    constructor() {
        this.migrationsPath = path.join(__dirname, '..', 'database', 'migrations');
        this.db = new DatabaseConnection();
    }

    async run() {
        const migrationFiles = this.getMigrationFiles();
        let count = 0;
        // Use Promise.all to wait for all migrations to complete
        await Promise.all(
            migrationFiles.map(async (file) => {
                const migrationName = file.replace('.js', '');
                const migrationModule = require(path.join(this.migrationsPath, file));
                const instantiatedMigrationModule = new migrationModule();
                const query = instantiatedMigrationModule.up();

                const success = await this.db.makeMigration(query, migrationName);
                if (success) {
                    count++;
                }
            })
        );

        // Check the count after all migrations are completed
        if (count === 0) {
            console.log('Nothing to migrate.');
            return;
        }
        console.log(`Migrated ${count} files successfully.`);
    }


    async migrateInit() {
        let migrationsTableQuery = '';
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

        await this.db.runQuery(migrationsTableQuery);
    }

    async rollback() {
        const migrationFiles = this.getMigrationFiles();

        // Use a for loop to ensure order
        await Promise.all(migrationFiles.map(async (file) => {
            const migrationName = file.replace('.js', '');
            const migrationModule = require(path.join(this.migrationsPath, file));
            const instantiatedMigrationModule = new migrationModule();
            const query = instantiatedMigrationModule.down();

            await this.db.makeMigration(query, migrationName, true);
        }));

        console.log('Rolled back successfully.');

        await this.run();
    }

    async dropAllTables() {
        let sql;
        const params = [];

        if (env('DATABASE') === 'mysql') {
            sql = `SELECT TABLE_NAME AS \`table\`
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME != 'migrations'`;
            params.push(config('app.database.mysql.database'));
        } else if (env('DATABASE') === 'sqlite') {
            sql = 'SELECT name AS table FROM sqlite_master WHERE type = "table" AND table NOT LIKE "sqlite_%"';
        }


        const tables = await this.db.runQueryNoLogs(sql, params);

        if (!tables.length) {
            console.log('No tables to drop.');
            return;
        }

        // Disable foreign key constraints for SQLite
        if (env('DATABASE') === 'sqlite') {
            await this.db.runQueryNoLogs('PRAGMA foreign_keys = OFF');
        }

        await Promise.all(tables.map(async (table) => {
            const dropTableQuery = `DROP TABLE IF EXISTS ${table.table};`;
            await this.db.runQueryNoLogs(dropTableQuery);
        }));

        // Re-enable foreign key constraints for SQLite
        if (env('DATABASE') === 'sqlite') {
            await this.db.runQueryNoLogs('PRAGMA foreign_keys = ON');
        }

        await this.db.runQueryNoLogs("DELETE FROM migrations");

        console.log('All tables dropped successfully.');

        await this.run();
    }

    getMigrationFiles() {
        return fs.readdirSync(this.migrationsPath).filter(file => file.endsWith('.js'));
    }
}

module.exports = MigrationRunner;
