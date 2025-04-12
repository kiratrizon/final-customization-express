const sqlite3 = require('better-sqlite3');
const path = require('path');

// Your path to the SQLite database file
const dbPath = path.join(__dirname, '..', 'database.db');

class SQLite {
    constructor() {
        this.dbPath = dbPath;
    }

    query(query, params = []) {
        return new Promise((resolve, reject) => {
            let db;
            let data;

            try {
                db = sqlite3(this.dbPath); // Use the path to open the DB
                const queryType = query.trim().split(' ')[0].toLowerCase();
                const stmt = db.prepare(query);

                switch (queryType) {
                    case 'insert':
                        const insertResult = stmt.run(params);
                        data = insertResult.lastInsertRowid;
                        break;
                    case 'update':
                    case 'delete':
                        const result = stmt.run(params);
                        data = result.changes > 0;
                        break;
                    case 'create':
                    case 'alter':
                    case 'drop':
                        stmt.run(params);
                        data = true;
                        break;
                    case 'select':
                        const rows = stmt.all(params);
                        data = rows.length > 0 ? rows : [];
                        break;
                    default:
                        data = stmt.run(params);
                        break;
                }

                resolve(data); // Return the result via resolve
            } catch (err) {
                console.log('SQLite Query Error:', err);
                reject(false); // Reject if an error occurs
            } finally {
                if (db) db.close(); // Close after query execution
            }
        });
    }

    escape(value) {
        if (typeof value === 'string') {
            const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "''");
            return `'${escaped}'`;
        }
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        if (value === null) {
            return 'NULL';
        }
        if (value instanceof Date) {
            return `'${value.toISOString()}'`;
        }
        return value;
    }
}

module.exports = SQLite;
