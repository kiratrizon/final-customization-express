const Database = require("../../main/database/Database");
const Carbon = require("./Carbon");
const RawSqlExecutor = require("./RawSqlExecutor");

class QueryBuilder {
    #whereQuery = [];
    #joinQuery = [];
    #orderByQuery = [];
    #limitQuery = null;
    #offsetQuery = null;
    #groupByQuery = [];
    #selectQuery = [];
    #valueQuery = [];
    #database;
    #modelName;
    #table;
    #model;
    #instanceModel;
    #fillable = [];
    #timestamp = true;
    #guarded = [];
    #hidden = [];
    constructor(model) {
        this.#model = model;
        this.#instanceModel = new model();
        this.#fillable = this.#instanceModel.fillable;
        this.#timestamp = this.#instanceModel.timestamp;
        this.#guarded = this.#instanceModel.guarded;
        this.#hidden = this.#instanceModel.hidden;
        delete this.#instanceModel.fillable;
        delete this.#instanceModel.timestamp;
        delete this.#instanceModel.guarded;
        delete this.#instanceModel.hidden;
        this.#modelName = model.name;
        this.#table = generateTableNames(this.#modelName);
        this.#database = new Database();
    }

    // Where clause
    where(...args) {
        let field, operator, value;

        if (args.length === 2) {
            [field, value] = args;
            operator = '=';  // Default to '=' if only 2 arguments
        } else if (args.length === 3) {
            [field, operator, value] = args;
        }

        // Handle BETWEEN case
        if (operator.toUpperCase() === 'BETWEEN') {
            if (Array.isArray(value) && value.length === 2) {
                if (this.#whereQuery.length === 0) {
                    this.#whereQuery.push(`${field} ${operator} ? AND ?`);
                } else {
                    this.#whereQuery.push(`AND ${field} ${operator} ? AND ?`);
                }
                this.#valueQuery.push(...value);
            } else {
                throw new Error('For BETWEEN operator, value must be an array with two elements');
            }
        } else {
            // Handle other operators
            if (this.#whereQuery.length === 0) {
                this.#whereQuery.push(`${field} ${operator} ?`);
            } else {
                this.#whereQuery.push(`AND ${field} ${operator} ?`);
            }
            this.#valueQuery.push(value);
        }
        return this;
    }

    // OrWhere clause
    orWhere(...args) {
        let field, operator, value;

        if (args.length === 2) {
            [field, value] = args;
            operator = '=';  // Default to '=' if only 2 arguments
        } else if (args.length === 3) {
            [field, operator, value] = args;
        }

        // Handle BETWEEN case
        if (operator.toUpperCase() === 'BETWEEN') {
            if (Array.isArray(value) && value.length === 2) {
                if (this.#whereQuery.length === 0) {
                    this.#whereQuery.push(`${field} ${operator} ? AND ?`);
                } else {
                    this.#whereQuery.push(`OR ${field} ${operator} ? AND ?`);
                }
                this.#valueQuery.push(...value);  // Push both start and end values for BETWEEN
            } else {
                throw new Error('For BETWEEN operator, value must be an array with two elements');
            }
        } else {
            // Handle other operators
            if (this.#whereQuery.length === 0) {
                this.#whereQuery.push(`${field} ${operator} ?`);
            } else {
                this.#whereQuery.push(`OR ${field} ${operator} ?`);
            }
            this.#valueQuery.push(value);
        }

        return this;
    }


    // Join clause
    join(table, firstKey, operator, secondKey) {
        this.#joinQuery.push(`INNER JOIN ${table} ON ${firstKey} ${operator} ${secondKey}`);
        return this;
    }

    leftJoin(table, firstKey, operator, secondKey) {
        this.#joinQuery.push(`LEFT JOIN ${table} ON ${firstKey} ${operator} ${secondKey}`);
        return this;
    }
    rightJoin(table, firstKey, operator, secondKey) {
        this.#joinQuery.push(`RIGHT JOIN ${table} ON ${firstKey} ${operator} ${secondKey}`);
        return this;
    }

    // Select columns
    select(...arr) {
        this.#selectQuery.push(arr);
        return this;
    }

    // Order by clause
    orderBy(column, direction = 'ASC') {
        this.#orderByQuery.push(`${column} ${direction}`);
        return this;
    }

    // Group by clause
    groupBy(column) {
        this.#groupByQuery.push(column);
        return this;
    }

    // Limit clause
    limit(limit) {
        this.#limitQuery = limit;
        return this;
    }

    // Offset clause
    offset(offset) {
        this.#offsetQuery = offset;
        return this;
    }

    // Final query generation and execution
    async get(defaultLogs = true) {
        let sql = this.toSql();
        let returnData;
        if (defaultLogs) {
            returnData = await RawSqlExecutor.run(sql, this.#valueQuery);
        } else {
            returnData = await RawSqlExecutor.runNoLogs(sql, this.#valueQuery);
        }
        this.#valueQuery = [];
        return returnData;
    }

    // Return SQL query as string
    toSql() {
        let query = `SELECT ${this.#selectQuery.length === 0 ? '*' : this.#selectQuery.join(', ')} FROM ${this.#table} as ${this.#modelName}`;

        if (this.#joinQuery.length) query += ` ${this.#joinQuery.join(' ')}`;
        if (this.#whereQuery.length) query += ` WHERE ${this.#whereQuery.join(' ')}`;
        if (this.#groupByQuery.length) query += ` GROUP BY ${this.#groupByQuery.join(', ')}`;
        if (this.#orderByQuery.length) query += ` ORDER BY ${this.#orderByQuery.join(' ')}`;
        if (this.#limitQuery) query += ` LIMIT ${this.#limitQuery}`;
        if (this.#offsetQuery) query += ` OFFSET ${this.#offsetQuery}`;
        this.#clear();
        return query;
    }

    // Helper to clear query state
    #clear() {
        this.#whereQuery = [];
        this.#joinQuery = [];
        this.#orderByQuery = [];
        this.#limitQuery = null;
        this.#offsetQuery = null;
        this.#groupByQuery = [];
        this.#selectQuery = [];
    }

    async create(data) {
        let filteredData = {};
        for (let key of Object.keys(data)) {
            if (this.#fillable.includes(key)) {
                filteredData[key] = data[key];
            }
        }
        this.#guarded.forEach((key) => {
            delete filteredData[key];
        });
        if (this.#timestamp) {
            filteredData['created_at'] = Carbon.getDateTime();
            filteredData['updated_at'] = Carbon.getDateTime();
        }
        let keys = Object.keys(filteredData);
        let values = Object.values(filteredData);
        let columns = keys.join(', ');
        let placeholders = keys.map(() => '?').join(', ');
        let sql = `INSERT INTO ${this.#table} (${columns}) VALUES (${placeholders})`;
        let id = await RawSqlExecutor.run(sql, values);
        if (!id) {
            return null;
        }
        const newData = {
            id: id,
            ...filteredData,
        };
        let created = newData;
        if (!!created) {
            const data = created;
            created = Object.assign(this.#instanceModel, created);
            const hiddens = {};
            this.#hidden.forEach((key) => {
                hiddens[key] = created[key];
                delete created[key];
            });
            let identifier = await this.#database.searchPrimaryName(created.constructor.name);
            if (identifier.length) {
                created.setIdentifier(identifier[0].name);
            }
            created.setPrivates(data, hiddens);
        }
        return created;
    }

    async update(data = {}) {
        let filteredData = {};
        for (let key of Object.keys(data)) {
            if (this.#fillable.includes(key)) {
                filteredData[key] = data[key];
            }
        }
        this.#guarded.forEach((key) => {
            delete filteredData[key];
        });
        if (this.#timestamp) {
            filteredData['updated_at'] = Carbon.getDateTime();
        }
        let keys = Object.keys(filteredData);
        let values = Object.values(filteredData);
        let setQuery = keys.map(key => `${key} = ?`).join(', ');
        let sql = `UPDATE ${this.#table} SET ${setQuery}`;
        if (this.#whereQuery.length) sql += ` WHERE ${this.#whereQuery.join(', ')}`;
        values.push(...this.#valueQuery);
        return await RawSqlExecutor.run(sql, values);

    }

    async find(id) {
        let sql = `SELECT * FROM ${this.#table} as ${this.#modelName} WHERE ${this.#modelName}.id = ?`;
        let found = await RawSqlExecutor.run(sql, [id]);
        found = found[0] || null;
        if (!!found) {
            const data = found;
            found = Object.assign(this.#instanceModel, found);
            const hiddens = {};
            this.#hidden.forEach((key) => {
                hiddens[key] = found[key];
                delete found[key];
            });
            let identifier = await this.#database.searchPrimaryName(found.constructor.name);
            if (identifier.length) {
                found.setIdentifier(identifier[0].name);
            }
            found.setPrivates(data, hiddens);
        }
        return found;
    }

    async findByEmail(email) {
        let sql = `SELECT * FROM ${this.#table} as ${this.#modelName} WHERE ${this.#modelName}.email = ? LIMIT 1;`;
        let found = await RawSqlExecutor.run(sql, [email]);
        found = found[0] || null;
        if (!!found) {
            const data = found;
            found = Object.assign(this.#instanceModel, found);
            const hiddens = {};
            this.#hidden.forEach((key) => {
                hiddens[key] = found[key];
                delete found[key];
            });
            let identifier = await this.#database.searchPrimaryName(found.constructor.name);
            if (identifier.length) {
                found.setIdentifier(identifier[0].name);
            }
            found.setPrivates(data, hiddens);
        }
        return found;
    }

    async all() {
        let sql = `SELECT * FROM ${this.#table} as ${this.#modelName}`;
        const data = await RawSqlExecutor.run(sql);
        data.forEach((ele) => {
            this.#hidden.forEach((key) => {
                delete ele[key];
            });
        });
        return data;
    }

    async query(...args) {
        // allowed select, insert, update and delete only
        const [sql, params] = args;
        const allowed = ['select', 'insert', 'update', 'delete'];
        const queryType = sql.trim().toLowerCase().split(' ')[0];
        if (!allowed.includes(queryType)) {
            throw new Error(`Invalid SQL query type: ${queryType}`);
        }
        return await RawSqlExecutor.run(sql, params);
    }
    async findByKey(key, value) {
        let sql = `SELECT * FROM ${this.#table} as ${this.#modelName} WHERE ${this.#modelName}.${key} = ?;`;
        const data = await RawSqlExecutor.run(sql, [value]);
        if (!!data && data.length) {
            return data[0];
        }
        return false;
    }
    async first(defaultLogs = true) {
        let sql = this.toSql();
        sql += ' LIMIT 1;';
        let data;
        if (defaultLogs) {
            data = await RawSqlExecutor.run(sql, this.#valueQuery);
        } else {
            data = await RawSqlExecutor.runNoLogs(sql, this.#valueQuery);
        }
        this.#valueQuery = [];
        if (!!data && data.length) {
            let returndata = data[0];
            returndata = Object.assign(this.#instanceModel, returndata);
            // this.#hidden.forEach((key)=>{
            //     delete returndata[key];
            // });
            return returndata;
        }
        return false;
    }
}

module.exports = QueryBuilder;
