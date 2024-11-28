const Carbon = require("../../../libraries/Materials/Carbon");
const Database = require("../../database/Database");
const ConstructorModel = require("./ConstructorModel");

class BaseModel extends ConstructorModel {
    #whereQuery = [];
    #valueQuery = [];
    #joinQuery = [];
    #orderByQuery = [];
    #limitQuery = null;
    #offsetQuery = null;
    #groupByQuery = [];
    #selectQuery = [];
    timestamp = true;
    fillable = [];
    constructor() {
        super();
        this.table = this.table || null;
        this.database = new Database();
    }

    #generateTableNames(entity) {
        if (!this.table) {
            const irregularPlurals = config('irregular_words');
            const splitWords = entity.split(/(?=[A-Z])/);
            const lastWord = splitWords.pop().toLowerCase();

            const pluralizedLastWord = (() => {
                if (irregularPlurals[lastWord]) {
                    return irregularPlurals[lastWord];
                }
                if (lastWord.endsWith('y')) {
                    return lastWord.slice(0, -1) + 'ies';
                }
                if (['s', 'x', 'z', 'ch', 'sh'].some((suffix) => lastWord.endsWith(suffix))) {
                    return lastWord + 'es';
                }
                return lastWord + 's';
            })();

            return [...splitWords, pluralizedLastWord].join('').toLowerCase();
        }
        return this.table;
    }

    getTableName() {
        return this.#generateTableNames(this.constructor.name);
    }

    async find(id) {
        try {
            const query = `SELECT * FROM ${this.getTableName()} WHERE id = ?`;
            const result = await this.database.runQuery(query, [id]);
            return result.length ? result[0] : null;
        } catch (error) {
            console.error(`Error in find():`, error);
            throw error;
        }
    }

    async all() {
        try {
            const query = `SELECT * FROM ${this.getTableName()}`;
            return await this.database.runQuery(query);
        } catch (error) {
            console.error(`Error in all():`, error);
            throw error;
        }
    }

    where(key, operator, value) {
        this.#whereQuery.push(`${key} ${operator} ?`);
        this.#valueQuery.push(value);
        return this;
    }

    orWhere(key, operator, value) {
        this.#whereQuery.push(`OR ${key} ${operator} ?`);
        this.#valueQuery.push(value);
        return this;
    }

    join(table, firstKey, operator, secondKey, type = 'INNER') {
        this.#joinQuery.push(`${type} JOIN ${table} ON ${firstKey} ${operator} ${secondKey}`);
        return this;
    }

    leftJoin(table, firstKey, operator, secondKey) {
        return this.join(table, firstKey, operator, secondKey, 'LEFT');
    }

    rightJoin(table, firstKey, operator, secondKey) {
        return this.join(table, firstKey, operator, secondKey, 'RIGHT');
    }

    orderBy(column, direction = 'ASC') {
        this.#orderByQuery,push(`${column} ${direction}`);
        return this;
    }

    limit(limit) {
        this.#limitQuery = limit;
        return this;
    }

    offset(offset) {
        this.#offsetQuery = offset;
        return this;
    }

    groupBy(column) {
        this.#groupByQuery.push(column);
        return this;
    }
    select(...arr){
        this.#selectQuery.push(arr);
        return this;
    }

    async get() {
        try {
            let query = `SELECT ${this.#selectQuery.length == 0 ? '*' : this.#selectQuery.join(', ')} FROM ${this.getTableName()}`;
            if (this.#joinQuery.length) query += ` ${this.#joinQuery.join(' ')}`;
            if (this.#whereQuery.length) query += ` WHERE ${this.#whereQuery.join(' ')}`;
            if (this.#groupByQuery.length) query += ` GROUP BY ${this.#groupByQuery.join(', ')}`;
            if (this.#orderByQuery.length) query += ` ORDER BY ${this.#orderByQuery.join(' ')}`;
            if (this.#limitQuery) query += ` LIMIT ${this.#limitQuery}`;
            if (this.#offsetQuery) query += ` OFFSET ${this.#offsetQuery}`;
            const results = await this.database.runQuery(query, this.#valueQuery);
            this.clear();
            return results;
        } catch (error) {
            return error;
        }
    }

    toSql(){
        let query = `SELECT ${this.#selectQuery.length == 0? '*' : this.#selectQuery.join(', ')} FROM ${this.getTableName()} as ${this.constructor.name}`;
        if (this.#joinQuery.length) query += ` ${this.#joinQuery.join(' ')}`;
        if (this.#whereQuery.length) query += ` WHERE ${this.#whereQuery.join(' ')}`;
        if (this.#groupByQuery.length) query += ` GROUP BY ${this.#groupByQuery.join(', ')}`;
        if (this.#orderByQuery.length) query += ` ORDER BY ${this.#orderByQuery.join(' ')}`;
        if (this.#limitQuery) query += ` LIMIT ${this.#limitQuery}`;
        if (this.#offsetQuery) query += ` OFFSET ${this.#offsetQuery}`;
        this.clear();
        return query;
    }

    async first() {
        try {
            this.limit(1);
            const results = await this.get();
            return results.length ? results[0] : null;
        } catch (error) {
            console.error(`Error in first():`, error);
            throw error;
        }
    }

    async create(data) {
        try {
            data = only(data, this.fillable);
            if (this.timestamp){
                const dateNow = Carbon.getDateTime();
                data['created_at'] = dateNow;
                data['updated_at'] = dateNow;
            }
            const keys = Object.keys(data);
            const values = Object.values(data);
            const placeholders = keys.map(() => '?').join(', ');
            const query = `INSERT INTO ${this.getTableName()} (${keys.join(', ')}) VALUES (${placeholders})`;
            return await this.database.runQuery(query, values);
        } catch (error) {
            return error;
        }
    }

    async update(id, data) {
        try {
            if (this.timestamp){
                data['updated_at'] = Carbon.getDateTime();
            }
            const keys = Object.keys(data);
            const values = Object.values(data);
            const setClause = keys.map((key) => `${key} = ?`).join(', ');
            const query = `UPDATE ${this.getTableName()} SET ${setClause} WHERE id = ?`;
            const result = await this.database.runQuery(query, [...values, id]);
            return result; // Relying on your this.database.runQuery to return boolean or relevant output
        } catch (error) {
            console.error(`Error in update():`, error);
            throw error;
        }
    }
    
    async delete(id) {
        try {
            const query = `DELETE FROM ${this.getTableName()} WHERE id = ?`;
            const result = await this.database.runQuery(query, [id]);
            return result; // Relying on your this.database.runQuery to return boolean or relevant output
        } catch (error) {
            console.error(`Error in delete():`, error);
            throw error;
        }
    }
    

    async paginate(page = 1, perPage = 10) {
        try {
            const offset = (page - 1) * perPage;
            this.limit(perPage).offset(offset);
            const results = await this.get();
            const countQuery = `SELECT COUNT(*) AS total FROM ${this.getTableName()}`;
            const countResult = await this.database.runQuery(countQuery);
            const total = countResult[0].total;
            return {
                data: results,
                currentPage: page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage),
            };
        } catch (error) {
            console.error(`Error in paginate():`, error);
            throw error;
        }
    }

    clear() {
        this.#whereQuery = [];
        this.#valueQuery = [];
        this.#joinQuery = [];
        this.#orderByQuery = [];
        this.#limitQuery = null;
        this.#offsetQuery = null;
        this.#groupByQuery = [];
        this.#selectQuery = [];
        return this;
    }

    async query(rawQuery, params = []) {
        try {
            return await this.database.runQuery(rawQuery, params);
        } catch (error) {
            console.error(`Error in query():`, error);
            throw error;
        }
    }
}

module.exports = BaseModel;
