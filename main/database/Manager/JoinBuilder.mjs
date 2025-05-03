class JoinProcessor {
    #where = [];
    #values = [];
    #joinTable = null;
    #alias = null;
    #joinType = null;
    #on = [];
    #whereLength;
    #useIndex = [];
    #orWhere = [];
    #orValues = [];
    constructor(table, type, whereLength) {
        this.#whereLength = whereLength;
        // Split by one or more spaces and trim each part
        const newTable = table.split(/\s+/).map((item) => item.trim());

        // Handle 'AS' as a case-insensitive keyword for alias
        if (newTable.length === 3 && newTable[1].toUpperCase() === 'AS') {
            this.#joinTable = newTable[0];  // Actual table name
            this.#alias = newTable[2];  // Alias for the table
        } else if (newTable.length === 2 && newTable[1].toUpperCase() !== 'AS') {
            this.#joinTable = newTable[0];  // Table with alias
            this.#alias = newTable[1];  // Alias for the table
        } else {
            this.#joinTable = newTable[0];  // Only table name, no alias
            this.#alias = null;
        }
        if (!this.#joinTable) {
            throw new Error('Join table name is required');
        }
        this.#joinType = type || 'INNER'; // Default to INNER JOIN
    }

    on(...conditions) {
        if (conditions.length < 2 || conditions.length > 3) {
            throw new Error('Join condition requires at least 2 arguments and at most 3 arguments');
        }

        // Destructure arguments
        let column, operator, column2;

        if (conditions.length === 2) {
            [column, column2] = conditions;
            operator = '='; // Default operator
        } else {
            [column, operator, column2] = conditions;
        }
        // check column 2 is a column reference
        if (!this.#isColumnReference(column2)) {
            column2 = `'${column2}'`;
        }

        // Allowed operators validation
        const allowedOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IN', 'NOT IN'];
        if (!allowedOperators.includes(operator)) {
            throw new Error(`Invalid operator: ${operator}`);
        }

        if (typeof column !== 'string') {
            throw new Error(`Invalid column name: ${column}`);
        }
        if (typeof column2 !== 'string') {
            throw new Error(`Invalid column name: ${column2}`);
        }

        if (!this.#on.length) {
            this.#on.push({ column, operator, args: column2, type: null });
        } else {
            this.#on.push({ column, operator, args: column2, type: 'AND' });
        }
        return this;
    }
    orOn(...conditions) {
        if (!this.#on.length) {
            throw new Error('No previous ON clause to apply OR condition');
        }
        if (conditions.length < 2 || conditions.length > 3) {
            throw new Error('Join condition requires at least 2 arguments and at most 3 arguments');
        }

        // Destructure arguments
        let column, operator, column2;

        if (conditions.length === 2) {
            [column, column2] = conditions;
            operator = '='; // Default operator
        } else {
            [column, operator, column2] = conditions;
        }

        // check column 2 is a column reference
        if (!this.#isColumnReference(column2)) {
            value.push();
            column2 = `'${column2}'`;
        }

        // Allowed operators validation
        const allowedOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IN', 'NOT IN'];
        if (!allowedOperators.includes(operator)) {
            throw new Error(`Invalid operator: ${operator}`);
        }

        if (typeof column !== 'string') {
            throw new Error(`Invalid column name: ${column}`);
        }
        if (typeof column2 !== 'string') {
            throw new Error(`Invalid column name: ${column2}`);
        }
        this.#on.push({ column, operator, args: column2, type: 'OR' });
        return this;
    }

    getJoin() {
        return { join: this.#on };
    }

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
        if ((this.#where.length + this.#whereLength) > 0) {
            this.#where.push({ ...condition, type: 'AND' }); // Default to AND, can modify if needed
        } else {
            this.#where.push({ ...condition, type: null }); // First where condition
        }

        this.#values.push(value ?? null); // Add value to #values array, null if not defined
        return this;
    }
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
        const operator = 'BETWEEN';
        if (this.#isWhereEmpty()) {
            this.#where.push({ column, operator, value: ['?', '?'], type: null });
        } else {
            this.#where.push({ column, operator, value: ['?', '?'], type: 'AND' });
        }
        this.#values.push(values[0], values[1]);
        return this;
    }

    orWhereBetween(column, values) {
        this.#orValidator();

        if (!is_array(values) || values.length !== 2) {
            throw new Error('orWhereBetween requires exactly 2 values');
        }
        const operator = 'BETWEEN';
        this.#orWhere.push({ column, operator, value: ['?', '?'], type: 'OR' });
        this.#orValues.push(values[0], values[1]);
        return this;
    }
    whereNotBetween(column, values) {
        if (!is_array(values) || values.length !== 2) {
            throw new Error('whereNotBetween requires exactly 2 values');
        }
        const operator = 'NOT BETWEEN';
        if (this.#isWhereEmpty()) {
            this.#where.push({ column, operator, value: ['?', '?'], type: null });
        } else {
            this.#where.push({ column, operator, value: ['?', '?'], type: 'AND' });
        }
        this.#values.push(values[0], values[1]);
        return this;
    }
    orWhereNotBetween(column, values) {
        this.#orValidator();

        if (!is_array(values) || values.length !== 2) {
            throw new Error('orWhereNotBetween requires exactly 2 values');
        }
        const operator = 'NOT BETWEEN';
        this.#orWhere.push({ column, operator, value: ['?', '?'], type: 'OR' });
        this.#orValues.push(values[0], values[1]);
        return this;
    }

    whereIn(column, values) {
        if (!is_array(values) || values.length === 0) {
            throw new Error('whereIn requires at least 1 value');
        }
        const operator = 'IN';
        if (this.#isWhereEmpty()) {
            this.#where.push({ column, operator, value: `(${values.map((item) => '?').join(', ')})`, type: null });
        } else {
            this.#where.push({ column, operator, value: `(${values.map((item) => '?').join(', ')})`, type: 'AND' });
        }
        this.#values.push(...values.map((item) => item ?? null));
        return this;
    }

    orWhereIn(column, values) {
        this.#orValidator();

        if (!is_array(values) || values.length === 0) {
            throw new Error('orWhereIn requires at least 1 value');
        }
        const operator = 'IN';
        this.#orWhere.push({ column, operator, value: `(${values.map((item) => '?').join(', ')})`, type: 'OR' });
        this.#orValues.push(...values.map((item) => item ?? null));;
        return this;
    }

    whereNotIn(column, values) {
        if (!is_array(values) || values.length === 0) {
            throw new Error('whereNotIn requires at least 1 value');
        }
        const operator = 'NOT IN';
        if (this.#isWhereEmpty()) {
            this.#where.push({ column, operator, value: `(${values.map((item) => '?').join(', ')})`, type: null });
        } else {
            this.#where.push({ column, operator, value: `(${values.map((item) => '?').join(', ')})`, type: 'AND' });
        }
        this.#values.push(...values.map((item) => item ?? null));;
        return this;
    }

    orWhereNotIn(column, values) {
        this.#orValidator();

        if (!is_array(values) || values.length === 0) {
            throw new Error('orWhereNotIn requires at least 1 value');
        }
        const operator = 'NOT IN';
        this.#orWhere.push({ column, operator, value: `(${values.map((item) => '?').join(', ')})`, type: 'OR' });
        this.#orValues.push(...values.map((item) => item ?? null));;
        return this;
    }

    #orValidator() {
        if ((this.#isWhereEmpty())) {
            throw new Error('No previous where clause to apply OR condition');
        }
    }

    #isWhereEmpty() {
        return (this.#where.length + this.#whereLength) === 0;
    }

    getAll() {
        return {
            where: this.#where,
            values: this.#values,
            joinTable: this.#joinTable,
            alias: this.#alias,
            joinType: this.#joinType,
            on: this.#on,
            useIndex: this.#useIndex,
            orWhere: this.#orWhere,
            orValues: this.#orValues,
        };
    }

    #isColumnReference(value) {
        return typeof value === 'string' && /^[\w]+\.[\w]+$/.test(value);
    }
    useIndex(index) {
        if (typeof index !== 'string') {
            throw new Error('Index name must be a string');
        }
        this.#useIndex.push(index);
        return this;
    }

}

export default JoinProcessor;