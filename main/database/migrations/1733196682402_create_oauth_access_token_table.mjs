import Blueprint from '../Blueprint.mjs';


class Migrate {
    tableName = 'oauth_access_token';
    up() {
        const blueprint = new Blueprint();

        const createTableSQL = blueprint.create(this.tableName, (table) => {
            table.id();
            table.string('name');
            table.text('token');
            table.integer('user_id');
            table.boolean('is_revoked', { defaultValue: 0 });
            table.datetime('expires_at');
            table.string('user_type');
            table.timestamp();
        });

        return createTableSQL;
    }

    down() {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
}

export default Migrate;