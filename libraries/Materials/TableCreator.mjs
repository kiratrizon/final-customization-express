class TableCreator {
	static create(tableName) {
		const dynamicClass = class {
			DB = require('./DB');
			#whereQuery = [];
			#joinQuery = [];
			#orderByQuery = [];
			#limitQuery = null;
			#offsetQuery = null;
			#groupByQuery = [];
			#selectQuery = [];
			#valueQuery = [];
			#table;
			constructor(tableName) {
				this.#table = tableName;
			}
			getTableName() {
				return this.#table;
			}

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

			get() {
				let sql = this.toSql();
				let returnData;
				returnData = this.DB.select(sql, this.#valueQuery);
				this.#valueQuery = [];
				return returnData;
			}

			toSql() {
				let query = `SELECT ${this.#selectQuery.length === 0 ? '*' : this.#selectQuery.join(', ')} FROM ${this.#table}`;

				if (this.#joinQuery.length) query += ` ${this.#joinQuery.join(' ')}`;
				if (this.#whereQuery.length) query += ` WHERE ${this.#whereQuery.join(' ')}`;
				if (this.#groupByQuery.length) query += ` GROUP BY ${this.#groupByQuery.join(', ')}`;
				if (this.#orderByQuery.length) query += ` ORDER BY ${this.#orderByQuery.join(' ')}`;
				if (this.#limitQuery) query += ` LIMIT ${this.#limitQuery}`;
				if (this.#offsetQuery) query += ` OFFSET ${this.#offsetQuery}`;
				this.#clear();
				return query;
			}

			#clear() {
				this.#whereQuery = [];
				this.#joinQuery = [];
				this.#orderByQuery = [];
				this.#limitQuery = null;
				this.#offsetQuery = null;
				this.#groupByQuery = [];
				this.#selectQuery = [];
			}

			insert(array = []) {
				let keys = [];
				let portionValue = [];
				array.forEach((e) => {
					Object.keys(e).forEach((key) => {
						if (!keys.includes(key)) keys.push(key);
					})
				});
				const placeholders = [];
				array.forEach((e) => {
					let values = [];
					Object.keys(e).forEach((key) => {
						portionValue.push(e[key] || 'DEFAULT');
						values.push('?');
					});
					placeholders.push(`(${values.join(', ')})`);
				});

				let columns = keys.join(', ');

				let sql = `INSERT INTO ${this.#table} (${columns}) VALUES ${placeholders.join(', ')}`;

				console.log(sql);
				console.log(portionValue);
				return this.DB.insert(sql, portionValue);
			}

			first() {
				let sql = this.toSql();
				sql += ' LIMIT 1;';
				let data;
				data = this.DB.select(sql, this.#valueQuery);
				this.#valueQuery = [];
				if (!!data && data.length) {
					let returndata = data[0];
					returndata = Object.assign({}, returndata);
					return returndata;
				}
				return false;
			}
		};
		Object.defineProperty(dynamicClass, 'name', {
			value: tableName
		});
		return new dynamicClass(tableName);
	}
}

export default TableCreator;