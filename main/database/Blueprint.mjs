import BlueprintAlter from "./BlueprintAlter.mjs";
import BlueprintCreateTable from "./BlueprintCreate.mjs";

class Blueprint {
    create(tableName, callback) {
        if (empty(tableName)) {
            throw new Error('Table name is required.');
        }
        const bpCreate = new BlueprintCreateTable(tableName);
        callback(bpCreate);
        const sql = bpCreate.toSql();
        return sql;
    }

    alter(tableName, callback) {
        if (empty(tableName)) {
            throw new Error('Table name is required.');
        }
        const bpAlter = new BlueprintAlter(tableName);
        callback(bpAlter);
        const sql = bpAlter.toSql();
        return sql;
    }
}

export default Blueprint;
