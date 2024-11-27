const Blueprint = require('../Blueprint');

class Migrate {
    tableName = 'users';
    up() {
        const blueprint = new Blueprint();
    
        const alterTable = blueprint.alter(this.tableName, (table) => {
            table.renameColumn('username', 'name');
        });

        return alterTable;
    }
    
    down() {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}

module.exports = Migrate;