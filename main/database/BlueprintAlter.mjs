const allowedDatabase = ['sqlite', 'mysql', 'postgresql'];
const dbType = dbUsed;

if (!allowedDatabase.includes(dbType)) {
    throw new Error(`Database type "${dbType}" is not supported.`);
}

class BlueprintAlter {
    #tableName;
    #alterQueries = [];

    constructor(tableName) {
        if (!tableName) {
            throw new Error('Table name is required.');
        }
        this.#tableName = tableName;
    }

    addColumn(name, type, args = {}) {
        const columnDef = `${name} ${type}`;
        let columnQuery = `ADD COLUMN ${columnDef}`;

        if (args.nullable) {
            columnQuery += ' NULL';
        } else {
            columnQuery += ' NOT NULL';
        }

        if (args.default !== undefined) {
            columnQuery += ` DEFAULT ${args.default}`;
        }

        if (args.unique) {
            columnQuery += ' UNIQUE';
        }

        this.#alterQueries.push(`ALTER TABLE ${this.#tableName} ${columnQuery}`);
        return this;
    }

    dropColumn(name) {
        this.#alterQueries.push(`ALTER TABLE ${this.#tableName} DROP COLUMN ${name}`);
        return this;
    }

    modifyColumn(name, newType, args = {}) {
        const columnDef = `${name} ${newType}`;
        let columnQuery = `ALTER COLUMN ${columnDef}`;

        if (args.nullable) {
            columnQuery += ' NULL';
        } else {
            columnQuery += ' NOT NULL';
        }

        if (args.default !== undefined) {
            columnQuery += ` SET DEFAULT ${args.default}`;
        }

        this.#alterQueries.push(`ALTER TABLE ${this.#tableName} ${columnQuery}`);
        return this;
    }

    addIndex(name, columns) {
        const indexQuery = `CREATE INDEX ${name} ON ${this.#tableName}(${columns.join(', ')})`;
        this.#alterQueries.push(indexQuery);
        return this;
    }

    dropIndex(name) {
        const indexQuery = `DROP INDEX ${name}`;
        this.#alterQueries.push(indexQuery);
        return this;
    }

    addForeignKey(name, column, referenceTable, referenceColumn, onDelete = 'CASCADE') {
        const foreignKeyQuery = `ADD CONSTRAINT ${name} FOREIGN KEY (${column}) REFERENCES ${referenceTable}(${referenceColumn}) ON DELETE ${onDelete}`;
        this.#alterQueries.push(`ALTER TABLE ${this.#tableName} ${foreignKeyQuery}`);
        return this;
    }

    getQueries() {
        return this.#alterQueries;
    }

    toSql() {
        return this.#alterQueries.join('; ');
    }
}

export default BlueprintAlter;
