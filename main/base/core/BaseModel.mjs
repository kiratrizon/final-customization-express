import QueryBuilder from "../../../main/database/Manager/QueryBuilder.mjs";
import ConstructorModel from "./ConstructorModel.mjs";


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

    static whereIn(...args) {
        const builder = new QueryBuilder(this);
        return builder.whereIn(...args);
    }

    static whereNotIn(...args) {
        const builder = new QueryBuilder(this);
        return builder.whereNotIn(...args);
    }

    static whereNull(...args) {
        const builder = new QueryBuilder(this);
        return builder.whereNull(...args);
    }

    static whereNotNull(...args) {
        const builder = new QueryBuilder(this);
        return builder.whereNotNull(...args);
    }

    static whereBetween(...args) {
        const builder = new QueryBuilder(this);
        return builder.whereBetween(...args);
    }
    static whereNotBetween(...args) {
        const builder = new QueryBuilder(this);
        return builder.whereNotBetween(...args);
    }

    static async delete(id) {
        const builder = new QueryBuilder(this);
        return await builder.delete(id);
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

export default BaseModel;
