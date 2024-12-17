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
        // Use a for loop to ensure order
        await Promise.all(migrationFiles.map(async (file) => {
            const migrationName = file.replace('.js', '');
            const migrationModule = require(path.join(this.migrationsPath, file));
            const instantiatedMigrationModule = new migrationModule();
            const query = instantiatedMigrationModule.up();

            const success = await this.db.makeMigration(query, migrationName);
            if (success) {
                count++;
            }
        }));
        if (count === 0) {
            console.log('Nothing to migrate.');
            return;
        }
        console.log('Migrated successfully.');
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
    }


    getMigrationFiles() {
        return fs.readdirSync(this.migrationsPath).filter(file => file.endsWith('.js'));
    }
}

module.exports = MigrationRunner;
