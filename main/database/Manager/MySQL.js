const mysql = require('mysql2');

class MySQL {
    static pool = null;

    constructor() {
        if (!MySQL.pool) {
            MySQL.pool = mysql.createPool(config('app.database.mysql'));
        }
    }

    query(query, params = []) {
        return new Promise((resolve, reject) => {
            const queryType = query.trim().split(' ')[0].toLowerCase();

            MySQL.pool.query(query, params, (err, results) => {
                if (err) {
                    console.log('MySQL Query Error:', err);
                    return resolve(null);
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
}

module.exports = MySQL;