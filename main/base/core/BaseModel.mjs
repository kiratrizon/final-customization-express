import EloquentBuilder from "../../../main/database/Manager/EloquentBuilder.mjs";


/** @type {typeof import('../../../main/database/Manager/QueryBuilder').default} */
const QueryBuilder = (await import("../../../main/database/Manager/QueryBuilder.mjs")).default;

/** @type {typeof import("../../../main/base/core/ConstructorModel.mjs").default} */
const ConstructorModel = (await import("../../../main/base/core/ConstructorModel.mjs")).default;

class BaseModel extends ConstructorModel {
    fillable = [];
    timestamp = true;
    guarded = [];
    hidden = [];
    static async create(data) {
        const eloquentBuilder = new EloquentBuilder(this);
        return await eloquentBuilder.create(data);
    }

    static async find(id) {
        const eloquentBuilder = new EloquentBuilder(this);
        return await eloquentBuilder.find(id);
    }

    static async findOrFail(id) {
        const eloquentBuilder = new EloquentBuilder(this);
        return await eloquentBuilder.findOrFail(id);
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

    static whereIn(...args) {
        const builder = new QueryBuilder(this);
        return builder.whereIn(args[0], args[1]);
    }

    static whereNotIn(...args) {
        const builder = new QueryBuilder(this);
        return builder.whereNotIn(args[0], args[1]);
    }

    static whereNull(column) {
        const builder = new QueryBuilder(this);
        return builder.whereNull(column);
    }

    static whereNotNull(column) {
        const builder = new QueryBuilder(this);
        return builder.whereNotNull(column);
    }

    static whereBetween(column, values = []) {
        const builder = new QueryBuilder(this);
        return builder.whereBetween(column, values);
    }
    static whereNotBetween(column, values = []) {
        const builder = new QueryBuilder(this);
        return builder.whereNotBetween(column, values);
    }

    save(data = {}) {

    }

    static query() {
        const builder = new QueryBuilder(this);
        return builder;
    }

    static select(...args) {
        const builder = new QueryBuilder(this);
        return builder.select(...args);
    }

    static async insert(data = []) {
        const builder = new QueryBuilder(this);
        return await builder.insert(data);
    }

    static async first() {
        const builder = new QueryBuilder(this);
        return await builder.first();
    }

    static orderBy(key, direction = 'ASC') {
        const builder = new QueryBuilder(this);
        return builder.orderBy(key, direction);
    }

    static async update(id = null, data = {}) {
        if (empty(id)) {
            return null;
        }
        const builder = new QueryBuilder(this);
        builder.where('id', id);
        return await builder.update(data);
    }
}

export default BaseModel;
