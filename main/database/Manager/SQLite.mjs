import sqlite3 from 'better-sqlite3';
import path from 'path';

// Simulate __dirname in ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const dbPath = path.join(__dirname, '..', 'database.sqlite');


class SQLite {
    static db = null;

    constructor() {
        if (!SQLite.db) {
            SQLite.db = sqlite3(dbPath);
        }
    }

    query(query, params = []) {
        return new Promise((resolve, reject) => {
            let data;

            try {
                const queryType = query.trim().split(' ')[0].toLowerCase();
                const stmt = SQLite.db.prepare(query);

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

                resolve(data);
            } catch (err) {
                console.error('SQLite Query Error:', err);
                console.log(query);
                resolve(null);
            }
        });
    }

    escape(value) {
        if (typeof value === 'string') {
            const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "''");
            return `'${escaped}'`;
        }
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (value === null) return 'NULL';
        if (value instanceof Date) return `'${value.toISOString()}'`;
        return value;
    }

    async close() {
        if (SQLite.db) {
            SQLite.db.close();
            SQLite.db = null;
        }
    }
}

export default SQLite;
