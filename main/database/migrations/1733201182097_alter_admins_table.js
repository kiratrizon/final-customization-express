const Blueprint = require('../Blueprint');

class Migrate {
    tableName = 'admins';
    up() {
        const blueprint = new Blueprint();
    
        const alterTable = blueprint.alter(this.tableName, (table) => {
            table.addColumn('password', 'TEXT');
        });

        return alterTable;
    }
    
    down() {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}

module.exports = Migrate;