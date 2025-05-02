class RawSQL {
    #dbType = 'sqlite';
    #config = {};

    constructor(databasetype, config) {
        this.#dbType = databasetype;
        this.#config = config;
    }

    build() {
        const {
            table,
            fields = ['*'],
            join = [],
            where = [],
            orWhere = [],
            orderBy = [],
            groupBy = [],
            limit,
            offset,
            useIndex = [],
            having = [],
            orHaving = [],
        } = this.#config;

        const db = this.#dbType;

        let sql = `SELECT ${fields.join(', ')} FROM ${table}`;
        if (!empty(useIndex) && db === 'mysql') {
            sql += ` USE INDEX (${useIndex.join(', ')})`;
        }
        if (!empty(join)) {
            join.forEach((e) => {
                const tableUsed = e.table;
                const joinType = e.type || 'INNER';
                let useIndex = '';
                if (db === 'mysql') {
                    useIndex = !empty(e.useIndex) ? ` USE INDEX(${e.useIndex.join(', ')})` : '';
                }
                const alias = isset(e.alias) ? ` AS ${e.alias}` : '';
                sql += ` ${joinType} JOIN ${tableUsed}${alias}${useIndex}`;
                let on = [];
                if (!empty(e.on)) {
                    on = e.on;
                    on.forEach((o) => {
                        const column = o.column;
                        const operator = o.operator || '=';
                        const args = o.args;
                        const type = o.type;
                        if (!isset(type)) {
                            sql += ` ON ${column} ${operator} ${args}`;
                        } else {
                            sql += ` ${type} ${column} ${operator} ${args}`
                        }
                    });
                }
            });
        }
        if (!empty(where)) {
            sql += ' WHERE';
            const sqlWhere = [];
            where.forEach((w) => {
                const column = w.column;
                const operator = w.operator || '=';
                const value = w.value;
                if (operator === 'BETWEEN') {
                    sqlWhere.push(`${column} ${operator} ${value[0]} AND ${value[1]}`);
                } else if (['IS NULL', 'IS NOT NULL'].includes(operator)) {
                    sqlWhere.push(`${column} ${operator}`);
                } else {
                    sqlWhere.push(`${column} ${operator} ${value}`);
                }
            });
            sql += ` ${sqlWhere.join(' AND ')}`;
        }
        if (!empty(orWhere)) {
            sql += ' OR';
            const sqlOrWhere = [];
            orWhere.forEach((w) => {
                const column = w.column;
                const operator = w.operator || '=';
                const value = w.value;
                if (operator === 'BETWEEN') {
                    sqlOrWhere.push(`${column} ${operator} ${value[0]} AND ${value[1]}`);
                } else {
                    sqlOrWhere.push(`${column} ${operator} ${value}`);
                }
            });
            sql += ` ${sqlOrWhere.join(' OR ')}`;
        }
        if (!empty(groupBy)) {
            sql += ` GROUP BY ${groupBy.join(', ')}`;
        }
        let havingProc = false;
        if (!empty(having)) { // Added check for having clause
            sql += ' HAVING';
            const sqlHaving = [];
            having.forEach((h) => {
                const column = h.column;
                const operator = h.operator || '=';
                const value = h.value;
                if (operator === 'BETWEEN') {
                    sqlHaving.push(`${column} ${operator} ${value[0]} AND ${value[1]}`);
                } else if (['IS NULL', 'IS NOT NULL'].includes(operator)) {
                    sqlHaving.push(`${column} ${operator}`);
                } else {
                    sqlHaving.push(`${column} ${operator} ${value}`);
                }
            });
            sql += ` ${sqlHaving.join(' AND ')}`;
            havingProc = true;
        }

        if (!empty(orHaving)) { // Added check for having clause
            if (!havingProc) {
                sql += ' HAVING';
            } else {
                sql += ' OR';
            }
            const sqlOrHaving = [];
            orHaving.forEach((h) => {
                const column = h.column;
                const operator = h.operator || '=';
                const value = h.value;
                if (operator === 'BETWEEN') {
                    sqlOrHaving.push(`${column} ${operator} ${value[0]} AND ${value[1]}`);
                } else if (['IS NULL', 'IS NOT NULL'].includes(operator)) {
                    sqlOrHaving.push(`${column} ${operator}`);
                } else {
                    sqlOrHaving.push(`${column} ${operator} ${value}`);
                }
            });
            sql += ` ${sqlOrHaving.join(' OR ')}`;
        }
        if (!empty(orderBy)) {
            const sqlOrderBy = [];
            orderBy.forEach((o) => {
                const column = o.column;
                const direction = o.direction || 'ASC';
                sqlOrderBy.push(`${column} ${direction}`);
            });
            sql += ` ORDER BY ${sqlOrderBy.join(', ')}`;
        }
        if (isset(limit)) {
            sql += ` LIMIT ${limit}`;
        }
        if (isset(offset)) {
            sql += ` OFFSET ${offset}`;
        }
        return sql;
    }
}
export default RawSQL;
