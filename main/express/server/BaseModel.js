const Carbon = require("../../../libraries/Materials/Carbon");
const QueryBuilder = require("../../../libraries/Materials/QueryBuilder");
const RawSqlExecutor = require("../../../libraries/Materials/RawSqlExecutor");
const ConstructorModel = require("./ConstructorModel");

class BaseModel extends ConstructorModel {
    fillable = [];
    timestamp = true;
    guarded = [];
    static async create(data) {
        const model = new this();
        let keys = Object.keys(data);
        keys.forEach(key => {
            if (!model.fillable.includes(key)) {
                throw new Error(`Column ${key} is not fillable`);
            }
        });
        if (model.timestamp) {
            data['created_at'] = Carbon.getDateTime();
            data['updated_at'] = Carbon.getDateTime();
        }
        const builder = new QueryBuilder(this);
        return await builder.create(data);
    }

    static async update(id, data) {
        const model = new this();
        let keys = Object.keys(data);
        keys.forEach(key => {
            if (!model.fillable.includes(key)) {
                throw new Error(`Column ${key} is not fillable`);
            }
        });
        if (model.timestamp) {
            data['updated_at'] = Carbon.getDateTime();
        }
        const builder = new QueryBuilder(this);
        return await builder.update(id, data);
    }

    static async find(id) {
        const builder = new QueryBuilder(this);
        return await builder.find(id);
    }

    static async findByEmail(email) {
        const builder = new QueryBuilder(this);
        return await builder.findByEmail(email);
    }

    static async findAll() {
        const builder = new QueryBuilder(this);
        return await builder.findAll();
    }

    // instances
    isAuth() {
        return false;
    }

    static where(...args) {
        const builder = new QueryBuilder(this);
        return builder.where(...args);
    }

    async save(data = {}) {
        const identifier = this.getIdentifier();
        const primary = this.getPrimaryValue();
        if (!primary) {
            delete this.fillable;
            delete this.timestamp;
            delete this.guarded;
        }
        const obj = { ...this, ...data };
        const objKeys = Object.keys(obj).filter(key => obj[key] !== undefined);
        const objValues = objKeys.map(key => obj[key]);

        let rawSql = '';
        let placeholders = objKeys.map(() => '?').join(', ');

        if (!primary) {
            // INSERT operation if no ID exists
            rawSql = `INSERT INTO ${generateTableNames(this.constructor.name)} (${objKeys.join(', ')}) VALUES (${placeholders})`;
        } else {
            if (!identifier) {
                throw new Error(`${this.constructor.name} has no primary key.`);
            }
            const updateFields = objKeys.map(key => `${key} = ?`).join(', ');
            rawSql = `UPDATE ${this.constructor.name} SET ${updateFields} WHERE ${identifier} = ?`;
            objValues.push(primary);
        }
        return await RawSqlExecutor.run(rawSql, objValues);
    }

}

module.exports = BaseModel;
