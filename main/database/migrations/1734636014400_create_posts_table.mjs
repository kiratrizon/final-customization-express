import Blueprint from '../Blueprint.mjs';


class Migrate {
    tableName = 'posts';
    up() {
        const blueprint = new Blueprint();

        const createTableSQL = blueprint.create(this.tableName, (table) => {
            table.id();
            table.string('title');
            table.integer('user_id');
            table.integer('type');
            table.timestamp();
        });

        return createTableSQL;
    }

    down() {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}

export default Migrate;