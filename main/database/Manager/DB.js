const QueryBuilder = require('./QueryBuilder');
const DatabaseManager = require('./DatabaseManager');

class DB {

    static table(tableName) {
        return new QueryBuilder(tableName, false);
    }

    static async query(sql, params) {
        const db = new DatabaseManager();
        const result = await db.runQuery(sql, params);
        return result;
    }

    static escape(value) {
        const db = new DatabaseManager();
        return db.escape(value);
    }
}

module.exports = DB;