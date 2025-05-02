import Blueprint from '../Blueprint.mjs';


class Migrate {
    tableName = 'users';
    up() {
        const blueprint = new Blueprint();

        const createTableSQL = blueprint.create(this.tableName, (table) => {
            table.id();
            table.string('name');
            table.string('email', { unique: true });
            table.string('password');
            table.timestamp();
        });

        return createTableSQL;
    }

    down() {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}

export default Migrate;