const { Client } = require('pg');

class Postgres {
    config = null;

    constructor() {
        this.config = config('app.database.postgresql'); // Your config loader (like env or custom)
    }

    query(query, params = []) {
        return new Promise((resolve, reject) => {
            const client = new Client(this.config);

            const queryType = query.trim().split(' ')[0].toLowerCase();

            client.connect((err) => {
                if (err) {
                    console.log('PostgreSQL Connection Error:', err);
                    return resolve(null);
                }

                client.query(query, params, (err, result) => {
                    let data;

                    if (err) {
                        console.log('PostgreSQL Query Error:', err);
                        client.end();
                        return resolve(null);
                    }

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

                    client.end();
                    return resolve(data);
                });
            });
        });
    }

    escape(value) {
        // Manual escaping (not recommended, safer to use parameterized queries)
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'number') return value;
        return `'${value.toString().replace(/'/g, "''")}'`;
    }
}

module.exports = Postgres;
