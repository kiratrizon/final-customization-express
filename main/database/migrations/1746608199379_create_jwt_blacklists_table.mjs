import Blueprint from '../Blueprint.mjs';


class Migrate {
    tableName = 'jwt_blacklists';
    up() {
        const blueprint = new Blueprint();

        const createTableSQL = blueprint.create(this.tableName, (table) => {
            table.id();
            table.string('token');
            table.string('origin');
            table.string('role');
            table.timestamp();
        });

        return createTableSQL;
    }

    down() {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}

export default Migrate;