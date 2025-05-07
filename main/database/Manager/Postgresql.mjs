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

    query(query, params = []) {
        return new Promise((resolve, reject) => {
            const queryType = query.trim().split(' ')[0].toLowerCase();

            this.#ensureConnection().then(connected => {
                if (!connected) return resolve(null);

                Postgres.client.query(query, params, (err, result) => {
                    if (err) {
                        console.error('PostgreSQL Query Error:', err);
                        return reject('PostgreSQL Query Error: ' + err);
                    }

                    let data;
                    switch (queryType) {
                        case 'insert':
                            data = result.rows[0]?.id || null;
                            break;
                        case 'update':
                        case 'delete':
                            data = result.rowCount > 0;
                            break;
                        case 'create':
                        case 'alter':
                        case 'drop':
                            data = true;
                            break;
                        case 'select':
                            data = result.rows.length > 0 ? result.rows : [];
                            break;
                        default:
                            data = result;
                            break;
                    }

                    return resolve(data);
                });
            });
        });
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
