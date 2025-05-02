const Blueprint = require('../Blueprint');

class Migrate {
    tableName = 'admins';
    up() {
        const blueprint = new Blueprint();

        const createTableSQL = blueprint.create(this.tableName, (table) => {
            table.id();
            table.string('name');
            table.string('email');
            table.string('password');
            table.timestamp();
            table.softDeletes();
        });

        return createTableSQL;
    }

    down() {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}

module.exports = Migrate;