import fs from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import DatabaseConnection from './Manager/DatabaseManager.mjs';
const dbType = await config('app.database.database');
// Simulate __dirname in ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// On Windows, remove the leading slash from the pathname (if it exists)
const cleanDirname = __dirname.startsWith('/') ? __dirname.slice(1) : __dirname;
class MigrationRunner {
    #db;
    constructor() {
        this.migrationsPath = path.join(cleanDirname, '..', 'database', 'migrations');
        console.log(this.migrationsPath);
        this.#db = new DatabaseConnection();
    }

    async run() {
        const migrationFiles = this.getMigrationFiles();
        console.log(migrationFiles);
        let count = 0;
        // Use Promise.all to wait for all migrations to complete
        for (let i = 0; i < migrationFiles.length; i++) {
            const file = migrationFiles[i];
            const migrationName = file.replace('.mjs', '');
            const migrationModule = await import(pathToFileURL(path.join(this.migrationsPath, file)).href);
            const instantiatedMigrationModule = new migrationModule.default();
            if (!is_function(instantiatedMigrationModule.up)) continue;
            const query = instantiatedMigrationModule.up();

            try {
                // Assuming makeMigration is a method that returns a promise
                const success = await this.#db.makeMigration(query, migrationName);
                if (success) {
                    count++;
                }
            } catch (error) {
                console.log(query);
                console.error(`Error processing migration ${migrationName}:`, error);
            }
        }

        await this.#db.close();
        // Check the count after all migrations are completed
        if (count === 0) {
            console.log('Nothing to migrate.');
            return;
        }
        console.log(`Migrated ${count} files successfully.`);
    }


    async migrateInit() {
        let migrationsTableQuery = '';
        if (dbType === 'mysql') {
            migrationsTableQuery = `
                CREATE TABLE IF NOT EXISTS migrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    migration_name VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
        } else if (dbType === 'sqlite') {
            migrationsTableQuery = `
                CREATE TABLE IF NOT EXISTS migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    migration_name VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `;
        }

        await this.#db.runQuery(migrationsTableQuery);
        await this.#db.close();
    }

    async rollback() {
        const migrationFiles = this.getMigrationFiles();

        for (const file of migrationFiles) {
            const migrationName = file.replace('.mjs', '');
            const migrationModule = await import(pathToFileURL(path.join(this.migrationsPath, file)).href);
            const instantiatedMigrationModule = new migrationModule.default();
            const query = instantiatedMigrationModule.down();

            await this.#db.makeMigration(query, migrationName, true);
        }
        console.log('Rolled back successfully.');

        await this.run();
    }

    async dropAllTables() {
        let sql;
        const params = [];

        if (dbType === 'mysql') {
            sql = `SELECT TABLE_NAME AS name
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = ?
                AND TABLE_NAME != 'migrations'`;
            let schema = await config('app.database.mysql.database');
            params.push(schema);
        } else if (dbType === 'sqlite') {
            sql = `SELECT name 
                    FROM sqlite_master 
                    WHERE type = 'table' 
                    AND name NOT LIKE 'sqlite_%'
                    AND name != 'migrations'`;

        }


        const tables = await this.#db.runQuery(sql, params);

        if (!tables.length) {
            console.log('No tables to drop.');
        }

        // Disable foreign key constraints for SQLite
        if (dbType === 'sqlite') {
            await this.#db.runQuery('PRAGMA foreign_keys = OFF');
        }

        // use forloop to wait for all drop table queries to finish
        for (const table of tables) {
            const dropTableQuery = `DROP TABLE IF EXISTS ${table.name};`;
            await this.#db.runQuery(dropTableQuery);
        }

        // Re-enable foreign key constraints for SQLite
        if (dbType === 'sqlite') {
            await this.#db.runQuery('PRAGMA foreign_keys = ON');
        }

        await this.#db.runQuery("DELETE FROM migrations");

        console.log('All tables dropped successfully.');

        await this.run();
    }

    getMigrationFiles() {
        return fs.readdirSync(this.migrationsPath).filter(file => file.endsWith('.mjs'));
    }
}

export default MigrationRunner;
