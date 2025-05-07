import mysql from 'mysql2';

class MySQL {
    static pool = null;
    static #mysqlProp;

    constructor() {
        if (!MySQL.pool) {
            MySQL.pool = mysql.createPool(MySQL.#mysqlProp);
        }
    }

    async query(query, params = []) {
        if (!MySQL.#mysqlProp) {
            throw new Error('MySQL not initialized');
        }

        const queryType = query.trim().split(' ')[0].toLowerCase();
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            MySQL.pool.query(query, params, (err, results) => {
                const duration = Date.now() - startTime;
                console.log(`Query executed in ${duration}ms: ${query}`); // Log query duration

                if (err) {
                    console.error('MySQL Query Error:', err.message, err.stack);
                    return reject('MySQL Query Error: ' + err);
                }

                let data;
                switch (queryType) {
                    case 'insert':
                        data = results.insertId;
                        break;
                    case 'update':
                    case 'delete':
                        data = results.affectedRows > 0;
                        break;
                    case 'create':
                    case 'alter':
                    case 'drop':
                        data = true;
                        break;
                    case 'select':
                        data = results.length > 0 ? results : [];
                        break;
                    default:
                        data = results;
                        break;
                }

                return resolve(data);
            });
        });
    }

    escape(value) {
        return mysql.escape(value);
    }

    close() {
        return new Promise((resolve, reject) => {
            if (MySQL.pool) {
                MySQL.pool.end(err => {
                    if (err) {
                        console.error('Error closing MySQL pool:', err);
                        return reject(err);
                    }
                    MySQL.pool = null;
                    resolve(true);
                });
            } else {
                resolve(false); // nothing to close
            }
        });
    }

    static async init() {
        const mysqlProp = await config('app.database.mysql');
        MySQL.#mysqlProp = mysqlProp;
    }
}

await MySQL.init()

export default MySQL;
