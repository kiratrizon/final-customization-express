const dbType = await config('app.database.database');

class Blueprint {
    constructor() {
        this.columns = [];
        this.alterOperations = [];
    }

    // Method to define the table creation with "CREATE TABLE" prefix
    create(tableName, callback) {
        callback(this);
        const columns = this.getColumns();
        return `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;
    }

    // Method to define the table alteration with "ALTER TABLE" prefix
    alter(tableName, callback) {
        callback(this);
        const alterOperations = this.getAlterOperations();
        return `ALTER TABLE ${tableName} ${alterOperations};`;
    }

    // Method for adding an "id" column (Primary Key)
    id() {
        const idDefinition = dbType === 'sqlite'
            ? 'INTEGER PRIMARY KEY'
            : 'INT AUTO_INCREMENT PRIMARY KEY';
        this.columns.push({ name: 'id', type: idDefinition });
    }

    // Method for adding a string column with optional constraints
    string(name, args = {}) {
        let { length } = args;
        if (length === undefined) length = 255;
        const type = dbType === 'sqlite' ? 'TEXT' : `VARCHAR(${length})`;
        this.#handleCreateColumn(name, type, args);
    }

    // Method for adding a text column with optional constraints
    text(name, args = {}) {
        const type = 'TEXT';
        this.#handleCreateColumn(name, type, args);
    }

    // Method for adding an integer column with optional constraints
    integer(name, args = {}) {
        const type = 'INTEGER';
        this.#handleCreateColumn(name, type, args);
    }

    // Method for adding a float column with optional constraints
    float(name, args = {}) {
        const type = dbType === 'sqlite' ? 'REAL' : 'FLOAT';
        this.#handleCreateColumn(name, type, args);
    }

    // Method for adding a double column with optional constraints
    double(name, args = {}) {
        const type = dbType === 'sqlite' ? 'REAL' : 'DOUBLE';
        this.#handleCreateColumn(name, type, args);
    }

    // Method for adding a boolean column with optional constraints
    boolean(name, args = {}) {
        const type = dbType === 'sqlite' ? 'INTEGER' : 'BOOLEAN';
        this.#handleCreateColumn(name, type, args);
    }

    // Method for adding a date column with optional constraints
    date(name, args = {}) {
        const type = 'DATE';
        this.#handleCreateColumn(name, type, args);
    }

    // Method for adding a datetime column with optional constraints
    datetime(name, args = {}) {
        const type = 'DATETIME';
        this.#handleCreateColumn(name, type, args);
    }
    #handleCreateColumn(name, type, { nullable = true, unique = false, defaultValue = 'NULL' } = {}) {
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== 'NULL') constraints.push(`DEFAULT ${defaultValue}`);
        this.columns.push({ name, type, constraints });
    }
    // Method for adding timestamp columns (created_at, updated_at)
    timestamp() {
        const createdAt = dbType === 'sqlite'
            ? 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            : 'DATETIME DEFAULT CURRENT_TIMESTAMP';  // Change to DATETIME for MySQL
        const updatedAt = dbType === 'sqlite'
            ? 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            : 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';

        this.columns.push({ name: 'created_at', type: createdAt });
        this.columns.push({ name: 'updated_at', type: updatedAt });
    }

    softDeletes() {
        const deletedAt = dbType === 'sqlite'
            ? 'DATETIME DEFAULT NULL'
            : 'DATETIME DEFAULT NULL';
        this.columns.push({ name: 'deleted_at', type: deletedAt });
    }

    // Get column definitions for CREATE TABLE
    getColumns() {
        return this.columns.map(col => {
            const constraints = col.constraints ? ` ${col.constraints.join(' ')}` : '';
            return `${col.name} ${col.type}${constraints}`;
        }).join(', ');
    }

    // ALTER TABLE methods for adding, dropping, changing, and renaming columns
    addColumn(name, type, { nullable = true, unique = false, defaultValue = 'NULL' } = {}) {
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== 'NULL') constraints.push(`DEFAULT ${defaultValue}`);
        this.alterOperations.push(`ADD COLUMN ${name} ${type}${constraints.length ? ' ' + constraints.join(' ') : ''}`);
    }

    dropColumn(name) {
        this.alterOperations.push(`DROP COLUMN ${name}`);
    }

    changeColumn(name, newType, { nullable = true, unique = false, defaultValue = 'NULL' } = {}) {
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== 'NULL') constraints.push(`DEFAULT ${defaultValue}`);
        this.alterOperations.push(`CHANGE COLUMN ${name} ${newType}${constraints.length ? ' ' + constraints.join(' ') : ''}`);
    }

    renameColumn(oldName, newName) {
        this.alterOperations.push(`RENAME COLUMN ${oldName} TO ${newName}`);
    }

    // Get ALTER operations as SQL
    getAlterOperations() {
        return this.alterOperations.join(', ');
    }

}

export default Blueprint;
