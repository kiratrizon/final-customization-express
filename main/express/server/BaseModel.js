const Carbon = require("../../../libraries/Materials/Carbon");
const QueryBuilder = require("../../../libraries/Materials/QueryBuilder");
const RawSqlExecutor = require("../../../libraries/Materials/RawSqlExecutor");
const ConstructorModel = require("./ConstructorModel");

class BaseModel extends ConstructorModel {
    fillable = [];
    timestamp = true;
    guarded = [];
    hidden = [];
    static async create(data) {
        const builder = new QueryBuilder(this);
        return await builder.create(data);
    }

    static async find(id) {
        const builder = new QueryBuilder(this);
        return await builder.find(id);
    }

    static async findByEmail(email) {
        const builder = new QueryBuilder(this);
        return await builder.findByEmail(email);
    }

    static async all() {
        const builder = new QueryBuilder(this);
        return await builder.all();
    }

    static where(...args) {
        const builder = new QueryBuilder(this);
        return builder.where(...args);
    }

    async save(data = {}) {
        const identifier = this.getIdentifier();
        const primary = this.getPrimaryValue();
        const timestamp = this.timestamp;
        if (!primary) {
            delete this.fillable;
            delete this.timestamp;
            delete this.guarded;
            if (timestamp) {
                data['created_at'] = Carbon.getDateTime();
                data['updated_at'] = Carbon.getDateTime();
            }
        } else {
            if (timestamp) {
                data['updated_at'] = Carbon.getDateTime();
            }
        }
        const obj = { ...this, ...data };
        const lastData = { ...this.getPrivates(), ...this.getHiddens() };
        if (primary) {
            Object.keys(lastData).forEach((key) => {
                if (obj[key] === lastData[key]) delete obj[key];
            });
        }
        const objKeys = Object.keys(obj).filter(key => obj[key] !== undefined);
        const objValues = objKeys.map(key => obj[key]);

        if (objKeys.length && objValues.length) {
            let rawSql = '';
            let placeholders = objKeys.map(() => '?').join(', ');

            if (!primary) {
                rawSql = `INSERT INTO ${generateTableNames(this.constructor.name)} (${objKeys.join(', ')}) VALUES (${placeholders})`;
            } else {
                if (!identifier) {
                    throw new Error(`${this.constructor.name} has no primary key.`);
                }
                const updateFields = objKeys.map(key => `${key} = ?`).join(', ');
                rawSql = `UPDATE ${generateTableNames(this.constructor.name)} SET ${updateFields} WHERE ${identifier} = ?`;
                objValues.push(primary);
            }
            return await RawSqlExecutor.run(rawSql, objValues);
        }
        return null;
    }

    static async query(...args) {
        const builder = new QueryBuilder(this);
        return await builder.query(...args);
    }

    static async findByKey(key, value) {
        const builder = new QueryBuilder(this);
        return await builder.findByKey(key, value);
    }

    static select(...args) {
        const builder = new QueryBuilder(this);
        return builder.select(...args);
    }

    static async insert(data = []) {
        const builder = new QueryBuilder(this);
        return await builder.insert(data);
    }

    static async first(){
        const builder = new QueryBuilder(this);
        return await builder.first();
    }
}

module.exports = BaseModel;
