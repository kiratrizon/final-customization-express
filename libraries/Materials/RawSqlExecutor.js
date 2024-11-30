const Database = require("../../main/database/Database");

class RawSqlExecutor {
    static database = new Database();

    static async run(rawSql, params = []) {
        return await RawSqlExecutor.database.runQuery(rawSql, params);
    }
}

module.exports = RawSqlExecutor;