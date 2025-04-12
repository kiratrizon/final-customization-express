const databaseProp = config('app.database');
const dbtype = databaseProp.type || 'sqlite';
class ExternalQuery {
    static queryGetPrimaryName(tableName) {
        const queryString = {
            "sqlite": `SELECT name FROM pragma_table_info('${tableName}') WHERE pk = 1;`,
            "mysql": `SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${databaseProp.mysql.database}' AND TABLE_NAME = '${tableName}' AND COLUMN_KEY = 'PRI';`,
        }

        return queryString[dbtype];
    }
}

module.exports = ExternalQuery;