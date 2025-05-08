import mysql from 'mysql2';

class MySQL {
    static pool = null;
    static #mysqlProp;

    constructor() {
        if (!MySQL.pool) {
            MySQL.pool = mysql.createPool(MySQL.#mysqlProp);
        }
    }

    query(query, params = []) {
        if (!MySQL.#mysqlProp) {
            throw new Error('MySQL not initialized');
        }

        const queryType = query.trim().split(' ')[0].toLowerCase();
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            MySQL.pool.query(query, params, (err, results) => {
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

    async checkSchema() { // Check if the schema exists
        const sql = "SELECT COUNT(*) AS count FROM information_schema.schemata WHERE schema_name = ?";
        const tempClient = { ...MySQL.#mysqlProp, database: 'mysql' };
        const pool = mysql.createPool(tempClient).promise();

        if (!isset(MySQL.#mysqlProp.database)) {
            throw new Error('MySQL schema not set');
        }
        try {
            const [rows] = await pool.query(sql, [MySQL.#mysqlProp.database]);
            return rows[0].count == 0 ? MySQL.#mysqlProp.database : false;
        } catch (e) {
            console.error('Error checking schema:', e.message, e.stack);
            throw new Error('Error checking schema: ' + e);
        } finally {
            await pool.end();
        }
    }

    async createSchema() {
        const sql = `CREATE SCHEMA IF NOT EXISTS ${MySQL.#mysqlProp.database}`;
        const tempClient = { ...MySQL.#mysqlProp, database: 'mysql' };
        const pool = mysql.createPool(tempClient).promise();

        if (!isset(MySQL.#mysqlProp.database)) {
            throw new Error('MySQL schema not set');
        }
        try {
            await pool.query(sql);
            return true;
        } catch (e) {
            console.error('Error creating schema:', e.message, e.stack);
            throw new Error('Error creating schema: ' + e);
        } finally {
            await pool.end();
        }
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
