const Database = require("../../main/database/Manager/DatabaseManager");

class RawSqlExecutor {
    static database = new Database();

    static run(rawSql, params = []) {
        return RawSqlExecutor.database.runQuery(rawSql, params);
    }
}

module.exports = RawSqlExecutor;