const Database = require("../../main/database/Database");
const TableCreator = require("./TableCreator");
const instantiatedDatabase = new Database();
class DB {
    static #queryRules = [
        'select',
        'insert',
        'update',
        'delete',
        'call',
    ];
    static #statementRules = [
        'create',
        'alter',
        'drop',
        'truncate'
    ];
    static async statement(sql, params = []) {
        DB.#firstValidator(sql);
        await instantiatedDatabase.runQueryNoReturn(sql, params);
    }
    static async select(sql, params = []) {
        DB.#validateRule(sql, 'select');
        return await instantiatedDatabase.runQuery(sql, params);
    }
    static async insert(sql, params = []) {
        DB.#validateRule(sql, 'insert');
        return await instantiatedDatabase.runQuery(sql, params);
    }
    static async update(sql, params = []) {
        DB.#validateRule(sql, 'update');
        return await instantiatedDatabase.runQuery(sql, params);
    }
    static async delete(sql, params = []) {
        DB.#validateRule(sql, 'delete');
        return await instantiatedDatabase.runQuery(sql, params);
    }
    static #validateRule(sql, type) {
        DB.#firstValidator(sql);
        type.toLowerCase();
        if (typeof sql !== 'string') {
            throw new Error(`Query must be a string`);
        }
        const queryType = sql.trim().toLowerCase().split(' ')[0].trim();
        // if type is select then querytype must be select or call
        if (type === 'select' && !['select', 'call'].includes(queryType)) {
            throw new Error(`Query must be a select or call statement`);
        } else if (type !== 'select' && queryType !== type) {
            throw new Error(`Query must be a ${type} query`);
        }
        return;
    }

    static #firstValidator(sql, includeStatement = true) {
        const queryType = sql.trim().toLowerCase().split(' ')[0].trim();
        const allRules = [...DB.#queryRules, ...(includeStatement ? DB.#statementRules : [])];
        if (allRules.includes(queryType)) {
            return;
        }
        throw new Error(`Query must be a ${allRules.join(', ')} query`);
    }

    static async query(sql, params) {
        DB.#firstValidator(sql, false);
        return await instantiatedDatabase.runQuery(sql, params);
    }

    static table(tableName) {
        return TableCreator.create(tableName);
    }
}

module.exports = DB;