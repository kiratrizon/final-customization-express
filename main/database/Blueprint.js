require('dotenv').config();

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
        const idDefinition = process.env.DATABASE === 'sqlite'
            ? 'INTEGER PRIMARY KEY'
            : 'INT AUTO_INCREMENT PRIMARY KEY';
        this.columns.push({ name: 'id', type: idDefinition });
    }

    // Method for adding a string column with optional constraints
    string(name, length = 255, { nullable = true, unique = false, defaultValue = null } = {}) {
        const type = process.env.DATABASE === 'sqlite' ? 'TEXT' : `VARCHAR(${length})`;
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT '${defaultValue}'`);
        this.columns.push({ name, type, constraints });
    }

    // Method for adding a text column with optional constraints
    text(name, { nullable = true, unique = false, defaultValue = null } = {}) {
        const type = 'TEXT';
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT '${defaultValue}'`);
        this.columns.push({ name, type, constraints });
    }

    // Method for adding an integer column with optional constraints
    integer(name, { nullable = true, unique = false, defaultValue = null } = {}) {
        const type = 'INTEGER';
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT ${defaultValue}`);
        this.columns.push({ name, type, constraints });
    }

    // Method for adding a float column with optional constraints
    float(name, { nullable = true, unique = false, defaultValue = null } = {}) {
        const type = process.env.DATABASE === 'sqlite' ? 'REAL' : 'FLOAT';
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT ${defaultValue}`);
        this.columns.push({ name, type, constraints });
    }

    // Method for adding a double column with optional constraints
    double(name, { nullable = true, unique = false, defaultValue = null } = {}) {
        const type = process.env.DATABASE === 'sqlite' ? 'REAL' : 'DOUBLE';
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT ${defaultValue}`);
        this.columns.push({ name, type, constraints });
    }

    // Method for adding a boolean column with optional constraints
    boolean(name, { nullable = true, unique = false, defaultValue = null } = {}) {
        const type = process.env.DATABASE === 'sqlite' ? 'INTEGER' : 'BOOLEAN';
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT ${defaultValue}`);
        this.columns.push({ name, type, constraints });
    }

    // Method for adding a date column with optional constraints
    date(name, { nullable = true, unique = false, defaultValue = null } = {}) {
        const type = 'DATE';
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT '${defaultValue}'`);
        this.columns.push({ name, type, constraints });
    }

    // Method for adding a datetime column with optional constraints
    datetime(name, { nullable = true, unique = false, defaultValue = null } = {}) {
        const type = 'DATETIME';
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT '${defaultValue}'`);
        this.columns.push({ name, type, constraints });
    }

    // Method for adding timestamp columns (created_at, updated_at)
    timestamp() {
        const createdAt = process.env.DATABASE === 'sqlite'
            ? 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            : 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
        const updatedAt = process.env.DATABASE === 'sqlite'
            ? 'DATETIME DEFAULT CURRENT_TIMESTAMP'
            : 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';

        this.columns.push({ name: 'created_at', type: createdAt });
        this.columns.push({ name: 'updated_at', type: updatedAt });
    }

    // Get column definitions for CREATE TABLE
    getColumns() {
        return this.columns.map(col => {
            const constraints = col.constraints ? ` ${col.constraints.join(' ')}` : '';
            return `${col.name} ${col.type}${constraints}`;
        }).join(', ');
    }

    // ALTER TABLE methods for adding, dropping, changing, and renaming columns
    addColumn(name, type, { nullable = true, unique = false, defaultValue = null } = {}) {
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT ${defaultValue}`);
        this.alterOperations.push(`ADD COLUMN ${name} ${type}${constraints.length ? ' ' + constraints.join(' ') : ''}`);
    }

    dropColumn(name) {
        this.alterOperations.push(`DROP COLUMN ${name}`);
    }

    changeColumn(name, newType, { nullable = true, unique = false, defaultValue = null } = {}) {
        let constraints = [];
        if (!nullable) constraints.push('NOT NULL');
        if (unique) constraints.push('UNIQUE');
        if (defaultValue !== null) constraints.push(`DEFAULT ${defaultValue}`);
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

module.exports = Blueprint;
