import JoinProcessor from './JoinBuilder.mjs';
import RawSQL from './RawSQL.mjs';
import DBManager from './DatabaseManager.mjs';
import Collection from './Collection.mjs';
import QueryInsert from './QueryInsert.mjs';

const dbUsed = await config('app.database.database');

class QueryBuilder {
    // for query builder
    #fields = [];
    #where = [];
    #join = [];
    #orderBy = [];
    #groupBy = [];
    #limit = null;
    #offset = null;
    #values = [];
    #table = null;
    #useIndex = [];
    #orWhere = [];
    #orValues = [];
    #having = [];
    #havingValues = [];
    #orHaving = [];
    #orHavingValues = [];
    // end for query builder

    #isModel;
    #model = null;
    #staticModel = null;
    constructor(prop, isModel = true) {
        if (!isModel) {
            this.#table = prop;
        } else {
            this.#model = new prop();
            this.#table = this.#model.table || generateTableNames(prop.name);
            this.#staticModel = prop;
        }
        this.#isModel = isModel;
    }

    select(...fields) {
        this.#fields.push(...fields);
        return this;
    }

    // where
    where(...conditions) {
        // Validate number of arguments
        if (conditions.length < 2 || conditions.length > 3) {
            throw new Error('Where clause requires at least 2 arguments and at most 3 arguments');
        }

        // Destructure arguments
        let column, operator, value;

        if (conditions.length === 2) {
            [column, value] = conditions;
            operator = '='; // Default operator
        } else {
            [column, operator, value] = conditions;
        }

        // Allowed operators validation
        const allowedOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE'];
        if (!allowedOperators.includes(operator)) {
            throw new Error(`Invalid operator: ${operator}`);
        }

        if (typeof column !== 'string') {
            throw new Error(`Invalid column name: ${column}`);
        }

        // Check if it's the first condition or if we're chaining
        const condition = { column, operator, value: '?' };

        // If this is not the first where clause, add AND or OR logic
        if (this.#where.length > 0) {
            this.#where.push({ ...condition, type: 'AND' }); // Default to AND, can modify if needed
        } else {
            this.#where.push({ ...condition, type: null }); // First where condition
        }

        this.#values.push(value ?? null); // Add value to #values array, null if not defined
        return this;
    }

    // orWhere method for handling OR conditions
    orWhere(...conditions) {
        this.#orValidator();

        // Validate number of arguments
        if (conditions.length < 2 || conditions.length > 3) {
            throw new Error('Where clause requires at least 2 arguments and at most 3 arguments');
        }

        // Destructure arguments
        let column, operator, value;

        if (conditions.length === 2) {
            [column, value] = conditions;
            operator = '='; // Default operator
        } else {
            [column, operator, value] = conditions;
        }

        // Allowed operators validation
        const allowedOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE'];
        if (!allowedOperators.includes(operator)) {
            throw new Error(`Invalid operator: ${operator}`);
        }

        if (typeof column !== 'string') {
            throw new Error(`Invalid column name: ${column}`);
        }

        // For OR condition
        const condition = { column, operator, value: '?' };

        // Push the OR condition with 'OR' logic
        this.#orWhere.push({ ...condition, type: 'OR' });

        this.#orValues.push(value ?? null); // Add value to #values array, null if not defined
        return this;
    }

    whereBetween(column, values) {
        if (!is_array(values) || values.length !== 2) {
            throw new Error('whereBetween requires exactly 2 values');
        }
        let type = null;
        if (!this.#isWhereEmpty()) {
            type = 'AND';
        }

        this.#where.push({ column, operator: 'BETWEEN', value: ['?', '?'], type });
        this.#values.push(values[0], values[1]);
        return this;
    }

    orWhereBetween(column, values) {
        this.#orValidator();

        if (!is_array(values) || values.length !== 2) {
            throw new Error('orWhereBetween requires exactly 2 values');
        }

        this.#orWhere.push({ column, operator: 'BETWEEN', value: ['?', '?'], type: 'OR' });
        this.#orValues.push(values[0], values[1]);
        return this;
    }

    whereNotBetween(column, values) {
        if (!is_array(values) || values.length !== 2) {
            throw new Error('whereNotBetween requires exactly 2 values');
        }
        let type = null;
        if (!this.#isWhereEmpty()) {
            type = 'AND';
        }
        this.#where.push({ column, operator: 'NOT BETWEEN', value: ['?', '?'], type });
        this.#values.push(values[0], values[1]);
        return this;
    }

    orWhereNotBetween(column, values) {
        this.#orValidator();

        if (!is_array(values) || values.length !== 2) {
            throw new Error('orWhereNotBetween requires exactly 2 values');
        }

        this.#orWhere.push({ column, operator: 'NOT BETWEEN', value: ['?', '?'], type: 'OR' });
        this.#orValues.push(values[0], values[1]);
        return this;
    }

    whereIn(column, values) {
        if (!is_array(values) || values.length === 0) {
            throw new Error('whereIn requires at least 1 value');
        }
        let type = null;
        if (!this.#isWhereEmpty()) {
            type = 'AND';
        }
        this.#where.push({ column, operator: 'IN', value: `(${values.map((item) => '?').join(', ')})`, type });
        this.#values.push(...values.map((item) => item ?? null));;
        return this;
    }
    orWhereIn(column, values) {
        this.#orValidator();
        if (!is_array(values) || values.length === 0) {
            throw new Error('orWhereIn requires at least 1 value');
        }
        this.#orWhere.push({ column, operator: 'IN', value: `(${values.map((item) => '?').join(', ')})`, type: 'OR' });
        this.#orValues.push(...values.map((item) => item ?? null));;
        return this;
    }

    whereNotIn(column, values) {
        if (!is_array(values) || values.length === 0) {
            throw new Error('whereNotIn requires at least 1 value');
        }
        let type = null;
        if (!this.#isWhereEmpty()) {
            type = 'AND';
        }
        this.#where.push({ column, operator: 'NOT IN', value: `(${values.map((item) => '?').join(', ')})`, type });
        this.#values.push(...values.map((item) => item ?? null));;
        return this;
    }
    orWhereNotIn(column, values) {
        this.#orValidator();
        if (!is_array(values) || values.length === 0) {
            throw new Error('orWhereNotIn requires at least 1 value');
        }
        this.#orWhere.push({ column, operator: 'NOT IN', value: `(${values.map((item) => '?').join(', ')})`, type: 'OR' });
        this.#orValues.push(...values.map((item) => item ?? null));;
        return this;
    }
    whereNull(column) {
        let type = null;
        if (!this.#isWhereEmpty()) {
            type = 'AND';
        }
        this.#where.push({ column, operator: 'IS NULL', type });
        return this;
    }
    orWhereNull(column) {
        this.#orValidator();
        this.#orWhere.push({ column, operator: 'IS NULL', type: 'OR' });
        return this;
    }
    whereNotNull(column) {
        let type = null;
        if (!this.#isWhereEmpty()) {
            type = 'AND';
        }
        this.#where.push({ column, operator: 'IS NOT NULL', type });
        return this;
    }
    orWhereNotNull(column) {
        this.#orValidator();
        this.#orWhere.push({ column, operator: 'IS NOT NULL', type: 'OR' });
        return this;
    }
    orderBy(column, direction = 'ASC') {
        if (typeof column !== 'string') {
            throw new Error(`Invalid column name: ${column}`);
        }
        const allowedDirections = ['ASC', 'DESC'];
        if (!allowedDirections.includes(direction.toUpperCase())) {
            throw new Error(`Invalid order direction: ${direction}`);
        }
        this.#orderBy.push({ column, direction: direction.toUpperCase() });
        return this;
    }
    groupBy(...columns) {
        if (columns.length === 0) {
            throw new Error('groupBy requires at least one column');
        }
        columns.forEach((column) => {
            if (typeof column !== 'string') {
                throw new Error(`Invalid column name: ${column}`);
            }
            this.#groupBy.push(column);
        });
        return this;
    }
    limit(value) {
        if (typeof value !== 'number' || value <= 0) {
            throw new Error('Limit must be a positive number');
        }
        this.#limit = value;
        return this;
    }
    offset(value) {
        if (typeof value !== 'number' || value < 0) {
            throw new Error('Offset must be a non-negative number');
        }
        this.#offset = value;
        return this;
    }

    // Method to get conditions for debugging
    getConditions() {
        return { where: this.#where, values: this.#values, orWhere: this.#orWhere, orValues: this.#orValues };
    }

    #orValidator() {
        if (this.#isWhereEmpty()) {
            throw new Error('No previous where clause to apply OR condition');
        }
    }

    join(table, ...conditions) {
        const type = 'INNER';
        this.#joinAdd(type, table, conditions);
        return this;
    }

    leftJoin(table, ...conditions) {
        const type = 'LEFT';
        this.#joinAdd(type, table, conditions);
        return this;
    }
    rightJoin(table, ...conditions) {
        const type = 'RIGHT';
        this.#joinAdd(type, table, conditions);
        return this;
    }
    fullJoin(table, ...conditions) {
        const type = 'FULL';
        this.#joinAdd(type, table, conditions);
        return this;
    }
    crossJoin(table, ...conditions) {
        const type = 'CROSS';
        this.#joinAdd(type, table, conditions);
        return this;
    }

    #joinAdd(type, table, conditions) {
        if (!conditions.length) {
            throw new Error('Join conditions are required');
        }
        if (conditions.length === 1) {
            if (is_function(conditions[0])) {
                const callback = conditions[0];
                const joinProcessor = new JoinProcessor(table, type, this.#where.length);
                callback(joinProcessor);
                const joinSet = joinProcessor.getAll();
                this.#where.push(...joinSet.where);
                this.#values.push(...joinSet.values);
                this.#orWhere.push(...joinSet.orWhere);
                this.#orValues.push(...joinSet.orValues);
                this.#join.push({
                    table: joinSet.joinTable,
                    type,
                    useIndex: joinSet.useIndex,
                    on: joinSet.on,
                    alias: joinSet.alias,
                })
            } else {
                throw new Error('Invalid join condition');
            }
        }
        else if (conditions.length === 2) {
            const [column1, column2] = conditions;
            if (is_array(values)) {
                this.#join.push({
                    table,
                    type,
                    on: [{
                        column: column1,
                        operator: '=',
                        args: column2
                    }],
                    useIndex: [],
                })
            }
        } else if (conditions.length === 3) {
            const [column1, operator, column2] = conditions;
            const allowedOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE'];
            if (!allowedOperators.includes(operator.toUpperCase())) {
                throw new Error(`Invalid operator: ${operator}`);
            }
            if (is_array(values)) {
                this.#join.push({
                    table,
                    type,
                    on: [{
                        column: column1,
                        operator,
                        args: column2
                    }],
                    useIndex: [],
                })
            }
        }
        else {
            throw new Error('Invalid number of join conditions');
        }
    }

    having(...conditions) {
        if (conditions.length < 2 || conditions.length > 3) {
            throw new Error('Having clause requires at least 2 arguments and at most 3 arguments');
        }

        let column, operator, value;

        if (conditions.length === 2) {
            [column, value] = conditions;
            operator = '='; // Default operator
        } else {
            [column, operator, value] = conditions;
        }

        const allowedOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE'];
        if (!allowedOperators.includes(operator)) {
            throw new Error(`Invalid operator: ${operator}`);
        }

        if (typeof column !== 'string') {
            throw new Error(`Invalid column name: ${column}`);
        }

        // Add HAVING condition
        this.#having.push({ column, operator, value: '?' });
        this.#havingValues.push(value ?? null); // Add value to having values array
        return this;
    }

    havingBetween(column, values) {
        if (!is_array(values) || values.length !== 2) {
            throw new Error('havingBetween requires exactly 2 values');
        }
        this.#having.push({ column, operator: 'BETWEEN', value: ['?', '?'] });
        this.#havingValues.push(values[0], values[1]);
        return this;
    }

    havingIn(column, values) {
        if (!is_array(values) || values.length === 0) {
            throw new Error('havingIn requires at least 1 value');
        }
        this.#having.push({ column, operator: 'IN', value: `(${values.map((item) => '?').join(', ')})` });
        this.#havingValues.push(...values.map((item) => item ?? null));;
        return this;
    }
    havingNotIn(column, values) {
        if (!is_array(values) || values.length === 0) {
            throw new Error('havingNotIn requires at least 1 value');
        }
        this.#having.push({ column, operator: 'NOT IN', value: `(${values.map((item) => '?').join(', ')})` });
        this.#havingValues.push(...values.map((item) => item ?? null));;
        return this;
    }
    havingNull(column) {
        this.#having.push({ column, operator: 'IS NULL' });
        return this;
    }
    havingNotNull(column) {
        this.#having.push({ column, operator: 'IS NOT NULL' });
        return this;
    }
    orHaving(...conditions) {
        if (conditions.length < 2 || conditions.length > 3) {
            throw new Error('Having clause requires at least 2 arguments and at most 3 arguments');
        }

        let column, operator, value;

        if (conditions.length === 2) {
            [column, value] = conditions;
            operator = '='; // Default operator
        } else {
            [column, operator, value] = conditions;
        }

        const allowedOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE'];
        if (!allowedOperators.includes(operator)) {
            throw new Error(`Invalid operator: ${operator}`);
        }

        if (typeof column !== 'string') {
            throw new Error(`Invalid column name: ${column}`);
        }

        // Add HAVING condition
        this.#orHaving.push({ column, operator, value: '?' });
        this.#orHavingValues.push(value ?? null); // Add value to having values array
        return this;
    }
    orHavingBetween(column, values) {
        if (!is_array(values) || values.length !== 2) {
            throw new Error('orHavingBetween requires exactly 2 values');
        }
        this.#orHaving.push({ column, operator: 'BETWEEN', value: ['?', '?'] });
        this.#orHavingValues.push(values[0], values[1]);
        return this;
    }
    orHavingIn(column, values) {
        if (!is_array(values) || values.length === 0) {
            throw new Error('orHavingIn requires at least 1 value');
        }
        this.#orHaving.push({ column, operator: 'IN', value: `(${values.map((item) => '?').join(', ')})` });
        this.#orHavingValues.push(...values.map((item) => item ?? null));;
        return this;
    }
    orHavingNotIn(column, values) {
        if (!is_array(values) || values.length === 0) {
            throw new Error('orHavingNotIn requires at least 1 value');
        }
        this.#orHaving.push({ column, operator: 'NOT IN', value: `(${values.map((item) => '?').join(', ')})` });
        this.#orHavingValues.push(...values.map((item) => item ?? null));;
        return this;
    }
    orHavingNull(column) {
        this.#orHaving.push({ column, operator: 'IS NULL' });
        return this;
    }
    orHavingNotNull(column) {
        this.#orHaving.push({ column, operator: 'IS NOT NULL' });
        return this;
    }

    #isWhereEmpty() {
        return this.#where.length === 0;
    }

    getAllProps() {
        return {
            table: this.#table,
            fields: !empty(this.#fields) ? this.#fields : ['*'],
            join: this.#join,
            where: this.#where,
            values: this.#values,
            orWhere: this.#orWhere,
            orValues: this.#orValues,
            groupBy: this.#groupBy,
            having: this.#having,
            havingValues: this.#havingValues,
            orHaving: this.#orHaving,
            orHavingValues: this.#orHavingValues,
            orderBy: this.#orderBy,
            limit: this.#limit,
            offset: this.#offset,
            useIndex: this.#useIndex,
        }

    }
    useIndex(...indexes) {
        if (indexes.length === 0) {
            throw new Error('useIndex requires at least one index');
        }
        indexes.forEach((index) => {
            if (typeof index !== 'string') {
                throw new Error(`Invalid index name: ${index}`);
            }
            this.#useIndex.push(index);
        });
        return this;
    }

    toSql() {
        if (this.#isModel && this.#model.softDelete) {
            this.whereNull('deleted_at');
        }
        const rsql = new RawSQL(dbUsed, this.getAllProps());
        let sql = rsql.build();
        return sql;
    }
    toSqlWithValues() {
        let sql = this.toSql();
        const values = this.#values.concat(this.#orValues, this.#havingValues, this.#orHavingValues);
        // escape values
        const newDB = new DBManager();
        sql = newDB.getQueryTrace(sql, values);
        return sql;
    }
    async get() {
        const sql = this.toSql();
        const values = this.#values.concat(this.#orValues, this.#havingValues, this.#orHavingValues);
        const newDB = new DBManager();
        let data = await newDB.runQuery(sql, values);
        if (this.#isModel) {
            data = new Collection(this.#staticModel).many(data);
        }
        return data;
    }

    async first() {
        const newDB = new DBManager();
        this.limit(1);
        const sql = this.toSql();
        const values = this.#values.concat(this.#orValues, this.#havingValues, this.#orHavingValues);
        const data = await newDB.runQuery(sql, values);
        if (this.#isModel) {
            return new Collection(this.#staticModel).one(data);
        }
        return data[0] || null;
    }

    // for collection

    async insert(data) {
        const insertData = [];

        if (is_array(data) && data.length) {
            insertData.push(...data);
        } else if (is_object(data)) {
            insertData.push(data);
        } else {
            throw new Error('Invalid data type for insert');
        }

        const newDB = new DBManager();
        const insertQuery = new QueryInsert(this.#table, insertData, dbUsed);
        const { sql, values } = insertQuery.build();
        const result = await newDB.runQuery(sql, values);
        return result;
    }

    async find(id) {
        this.where('id', id);
        return await this.first();
    }
    async delete(id) {
        const newDB = new DBManager();
        if (this.#isModel && this.#model.softDelete) {
            const sql = `UPDATE ${this.#table} SET deleted_at = ? WHERE id = ?`;
            const values = [date(), id];
            return await newDB.runQuery(sql, values);
        } else {
            const sql = `DELETE FROM ${this.#table} WHERE id = ?`;
            const values = [id];
            return await newDB.runQuery(sql, values);
        }
    }
}

export default QueryBuilder;