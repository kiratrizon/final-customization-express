const allowedDatabase = ['sqlite', 'mysql', 'postgresql'];
const dbType = dbUsed;
if (!allowedDatabase.includes(dbType)) {
    throw new Error(`Database type "${dbType}" is not supported.`);
}

class BlueprintCreateTable {
    #columns = [];
    #indexes = [];
    #tableName;
    constructor(tableName) {
        if (empty(tableName)) {
            throw new Error('Table name is required.');
        }
        this.#tableName = tableName;
    }
    id() {
        const column = {
            column: 'id',
            datatype: dbType === 'sqlite' ? 'INTEGER PRIMARY KEY' :
                dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' :
                    'SERIAL PRIMARY KEY'
        };
        this.#columns.push(column);
        return this;
    }

    timestamp() {
        const columnCreatedAt = {
            column: 'created_at',
            datatype: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        };
        const columnUpdatedAt = {
            column: 'updated_at',
            datatype: dbType === 'mysql'
                ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
                : 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        };
        this.#columns.push(columnCreatedAt, columnUpdatedAt);
        return this;
    }

    softDeletes() {
        const column = {
            column: 'deleted_at',
            datatype: 'TIMESTAMP NULL'
        };
        this.#columns.push(column);
        return this;
    }
    #handleCreateColumn(name, type, args) {
        let columnDef = { column: name, datatype: type };

        if (args.nullable) {
            columnDef.datatype += ' NULL';
        } else {
            columnDef.datatype += ' NOT NULL';
        }

        if (isset(args.default) && !empty(args.default)) {
            columnDef.datatype += ` DEFAULT ${args.default}`;
        }

        if (args.unique) {
            columnDef.datatype += ' UNIQUE';
        }

        this.#columns.push(columnDef);
    }
    string(name, args = {}) {
        const type = dbType === 'sqlite' ? 'TEXT' : 'VARCHAR(255)';
        this.#handleCreateColumn(name, type, args);
        return this;
    }
    text(name, args = {}) {
        const type = 'TEXT';
        this.#handleCreateColumn(name, type, args);
        return this;
    }
    integer(name, args = {}) {
        const type = 'INTEGER';
        this.#handleCreateColumn(name, type, args);
        return this;
    }
    float(name, args = {}) {
        const type = dbType === 'sqlite' ? 'REAL' : 'FLOAT';
        this.#handleCreateColumn(name, type, args);
        return this;
    }
    double(name, args = {}) {
        const type = dbType === 'sqlite' ? 'REAL' : 'DOUBLE';
        this.#handleCreateColumn(name, type, args);
        return this;
    }
    boolean(name, args = {}) {
        const type = dbType === 'sqlite' ? 'INTEGER' : 'BOOLEAN';
        this.#handleCreateColumn(name, type, args);
        return this;
    }
    date(name, args = {}) {
        const type = 'DATE';
        this.#handleCreateColumn(name, type, args);
        return this;
    }
    datetime(name, args = {}) {
        const type = 'DATETIME';
        this.#handleCreateColumn(name, type, args);
        return this;
    }
    index(name) {
        // Create the CREATE INDEX statement with dynamic table name
        this.#indexes.push(`CREATE INDEX ${name}_index ON ${this.#tableName}(${name})`);
        return this;
    }
    foreign(name, args = {}) {
        const columnDef = { column: name, datatype: 'FOREIGN KEY' };

        if (args.references && args.onTable) {
            // Format the foreign key as `REFERENCES table_name(column_name)`
            columnDef.datatype += ` REFERENCES ${args.onTable}(${args.references})`;
        }

        // Handle ON DELETE and ON UPDATE clauses
        if (args.onDelete) {
            columnDef.datatype += ` ON DELETE ${args.onDelete}`;
        }
        if (args.onUpdate) {
            columnDef.datatype += ` ON UPDATE ${args.onUpdate}`;
        }

        this.#columns.push(columnDef);
        return this;
    }
    primary(...columns) {
        if (columns.length === 0) {
            return this;
        }
        const columnDef = { column: 'PRIMARY KEY', datatype: `(${columns.join(', ')})` };
        this.#columns.push(columnDef);
        return this;
    }

    toSql() {
        let sql = `CREATE TABLE ${this.#tableName} (`;
        const columnDefinitions = this.#columns.map(col => `${this.#escapeIdentifier(col.column)} ${col.datatype}`);
        sql += columnDefinitions.join(', ');
        sql += ');';

        // Add indexes
        this.#indexes.forEach(index => {
            sql += ` ${index};`;
        });

        return sql;
    }
    #escapeIdentifier(column) {
        switch (dbUsed) {
            case 'mysql':
                return `\`${column}\``; // backticks for MySQL
            case 'pgsql':
            case 'postgres':
            case 'postgresql':
            case 'sqlite':
                return `"${column.replace(/"/g, '""')}"`; // double quotes, escaped if needed
            default:
                return column; // fallback (no escaping)
        }
    }
}


export default BlueprintCreateTable;