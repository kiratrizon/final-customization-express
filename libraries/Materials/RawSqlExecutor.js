const Database = require("../../main/database/Database");

class RawSqlExecutor {
    static database = new Database();

    static run(rawSql, params = []) {
        return RawSqlExecutor.database.runQuery(rawSql, params);
    }

    static runNoLogs(rawSql, params = []) {
        return RawSqlExecutor.database.runQueryNoLogs(rawSql, params);
    }
}

module.exports = RawSqlExecutor;