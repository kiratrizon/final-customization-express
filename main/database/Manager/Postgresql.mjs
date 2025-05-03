import { Client } from 'pg';
import Configure from '../../../libraries/Materials/Configure.mjs';

class Postgres {
    static client = null;
    static #pgConfig;

    constructor() {
        if (!Postgres.client) {
            Postgres.client = new Client(Postgres.#pgConfig);
        }
    }

    static async init() {
        const pgConfig = await Configure.read('app.database.postgresql');
        Postgres.#pgConfig = pgConfig;
    }

    async #ensureConnection() {
        if (Postgres.client._connected !== true) {
            try {
                await Postgres.client.connect();
            } catch (err) {
                console.error('PostgreSQL Connection Error:', err);
                return false;
            }
        }
        return true;
    }

    async query(query, params = []) {
        const queryType = query.trim().split(' ')[0].toLowerCase();

        const connected = await this.#ensureConnection();
        if (!connected) return null;

        try {
            const result = await Postgres.client.query(query, params);

            switch (queryType) {
                case 'insert':
                    return result.rows[0]?.id || null;
                case 'update':
                case 'delete':
                    return result.rowCount > 0;
                case 'create':
                case 'alter':
                case 'drop':
                    return true;
                case 'select':
                    return result.rows.length > 0 ? result.rows : [];
                default:
                    return result;
            }
        } catch (err) {
            console.error('PostgreSQL Query Error:', err);
            return null;
        }
    }

    escape(value) {
        // Use with care – best to stick with parameterized queries
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'number') return value;
        return `'${value.toString().replace(/'/g, "''")}'`;
    }

    async close() {
        if (Postgres.client) {
            try {
                await Postgres.client.end();
                Postgres.client = null;
                return true;
            } catch (err) {
                console.error('Error closing PostgreSQL client:', err);
                return false;
            }
        }
        return false;
    }
}

await Postgres.init();

export default Postgres;
