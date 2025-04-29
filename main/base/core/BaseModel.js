const QueryBuilder = require("../../../main/database/Manager/QueryBuilder");
const RawSqlExecutor = require("../../../libraries/Materials/RawSqlExecutor");
const ConstructorModel = require("./ConstructorModel");

class BaseModel extends ConstructorModel {
    fillable = [];
    timestamp = true;
    guarded = [];
    hidden = [];
    static create(data) {
        const builder = new QueryBuilder(this);
        return builder.create(data);
    }

    static async find(id) {
        const builder = new QueryBuilder(this);
        builder.where('id', id);
        return await builder.first();
    }

    static async all() {
        const builder = new QueryBuilder(this);
        return await builder.get();
    }

    static async whereFirst(column, value) {
        const builder = new QueryBuilder(this);
        builder.where(column, value)
        return await builder.first();
    }

    static where(...args) {
        const builder = new QueryBuilder(this);
        return builder.where(...args);
    }

    save(data = {}) {

    }

    static query() {
        return new QueryBuilder(this);
    }

    static select(...args) {
        const builder = new QueryBuilder(this);
        return builder.select(...args);
    }

    static insert(data = []) {
        const builder = new QueryBuilder(this);
        return builder.insert(data);
    }

    static first() {
        const builder = new QueryBuilder(this);
        return builder.first();
    }

    static orderBy(key, direction = 'ASC') {
        const builder = new QueryBuilder(this);
        return builder.orderBy(key, direction);
    }
}

module.exports = BaseModel;
