import Database from "../../main/database/Manager/DatabaseManager.mjs";

class RawSqlExecutor {
    static database = new Database();

    static async run(rawSql, params = []) {
        return await RawSqlExecutor.database.runQuery(rawSql, params);
    }
}

export default RawSqlExecutor;