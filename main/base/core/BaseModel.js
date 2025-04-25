const QueryBuilder = require("../../../main/database/Manager/QueryBuilder");
const RawSqlExecutor = require("../../../libraries/Materials/RawSqlExecutor");
const ConstructorModel = require("./ConstructorModel");
const Collection = require("../../database/Manager/Collection");

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
        const identifier = this.getIdentifier();
        const primary = this.getPrimaryValue();
        const timestamp = this.timestamp;
        if (!primary) {
            delete this.fillable;
            delete this.timestamp;
            delete this.guarded;
            if (timestamp) {
                data['created_at'] = date();
                data['updated_at'] = date();
            }
        } else {
            if (timestamp) {
                data['updated_at'] = date();
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
            return RawSqlExecutor.run(rawSql, objValues);
        }
        return null;
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
