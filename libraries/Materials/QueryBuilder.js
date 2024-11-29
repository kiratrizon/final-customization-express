const Database = require("../../main/database/Database");

class QueryBuilder {
    #whereQuery = [];
    #joinQuery = [];
    #orderByQuery = [];
    #limitQuery = null;
    #offsetQuery = null;
    #groupByQuery = [];
    #selectQuery = [];
    #valueQuery = [];
    #database
    constructor(model) {
        this.modelName = model.name;
        this.table = this.#generateTableNames(this.modelName);
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
    join(table, firstKey, operator, secondKey, type = 'INNER') {
        this.#joinQuery.push(`${type} JOIN ${table} ON ${firstKey} ${operator} ${secondKey}`);
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
    async get() {
        let sql = this.toSql();
        try {
            return await this.#database.runQuery(sql, this.#valueQuery);
        } catch (error) {
            console.error('Error in get():', error);
            throw error;
        } finally {
            this.#clear();
        }
    }

    // Return SQL query as string
    toSql() {
        let query = `SELECT ${this.#selectQuery.length === 0 ? '*' : this.#selectQuery.join(', ')} FROM ${this.table} as ${this.modelName}`;
        
        if (this.#joinQuery.length) query += ` ${this.#joinQuery.join(' ')}`;
        if (this.#whereQuery.length) query += ` WHERE ${this.#whereQuery.join(' ')}`;
        if (this.#groupByQuery.length) query += ` GROUP BY ${this.#groupByQuery.join(', ')}`;
        if (this.#orderByQuery.length) query += ` ORDER BY ${this.#orderByQuery.join(' ')}`;
        if (this.#limitQuery) query += ` LIMIT ${this.#limitQuery}`;
        if (this.#offsetQuery) query += ` OFFSET ${this.#offsetQuery}`;
        
        return query;
    }

    // Helper to clear query state
    #clear() {
        this.#whereQuery = [];
        this.#valueQuery = [];
        this.#joinQuery = [];
        this.#orderByQuery = [];
        this.#limitQuery = null;
        this.#offsetQuery = null;
        this.#groupByQuery = [];
        this.#selectQuery = [];
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

    async create(data){
        let keys = Object.keys(data);
        let values = Object.values(data);
        let columns = keys.join(', ');
        let placeholders = keys.map(() => '?').join(', ');
        let sql = `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})`;
        try {
            return await this.#database.runQuery(sql, values);
        } catch (error) {
            console.error('Error in create():', error);
            throw error;
        }
    }

    async update(id, data = {}){
        let keys = Object.keys(data);
        let values = Object.values(data);
        let setQuery = keys.map(key => `${key} = ?`).join(', ');
        let sql = `UPDATE ${this.table} SET ${setQuery} WHERE id = ?`;
        values.push(id);
        try {
            return await this.#database.runQuery(sql, values);
        } catch (error) {
            console.error('Error in update():', error);
            throw error;
        }        
    }

    async find(id){
        let sql = `SELECT * FROM ${this.table} as ${this.modelName} WHERE id = ?`;
        try {
            return await this.#database.runQuery(sql, [id]);
        } catch (error) {
            console.error('Error in find():', error);
            throw error;
        }
    }

    async findByEmail(email){
        let sql = `SELECT * FROM ${this.table} as ${this.modelName} WHERE email = ?`;
        try {
            return await this.#database.runQuery(sql, [email]);
        } catch (error) {
            console.error('Error in findByEmail():', error);
            throw error;
        }
    }

    async findAll(){
        let sql = `SELECT * FROM ${this.table} as ${this.modelName}`;
        try {
            return await this.#database.runQuery(sql);
        } catch (error) {
            console.error('Error in findAll():', error);
            throw error;
        }
    }
}

module.exports = QueryBuilder;
