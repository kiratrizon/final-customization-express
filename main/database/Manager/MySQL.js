const mysql = require('mysql2');

class MySQL {
    config = null;

    constructor() {
        this.config = config('app.database.mysql');
    }

    query(query, params = []) {
        return new Promise((resolve, reject) => {
            const connection = mysql.createConnection(this.config);

            const queryType = query.trim().split(' ')[0].toLowerCase();

            connection.query(query, params, (err, results) => {
                let data;

                if (err) {
                    console.log('MySQL Query Error:', err);
                    connection.end();
                    return reject(false);
                }

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

                connection.end();
                return resolve(data);
            });
        });
    }

    escape(value) {
        return mysql.escape(value);
    }

}

module.exports = MySQL;