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

    id() {
        const idDefinition = process.env.DATABASE === 'sqlite'
            ? 'INTEGER PRIMARY KEY'
            : 'INT AUTO_INCREMENT PRIMARY KEY';
        this.columns.push({ name: 'id', type: idDefinition });
    }

    string(name, length = 255) {
        const type = process.env.DATABASE === 'sqlite' ? 'TEXT' : `VARCHAR(${length})`;
        this.columns.push({ name, type });
    }

    text(name) {
        this.columns.push({ name, type: 'TEXT' });
    }

    integer(name) {
        this.columns.push({ name, type: 'INTEGER' });
    }

    float(name) {
        const type = process.env.DATABASE === 'sqlite' ? 'REAL' : 'FLOAT';
        this.columns.push({ name, type });
    }

    double(name) {
        const type = process.env.DATABASE === 'sqlite' ? 'REAL' : 'DOUBLE';
        this.columns.push({ name, type });
    }

    boolean(name) {
        const type = process.env.DATABASE === 'sqlite' ? 'INTEGER' : 'BOOLEAN';
        this.columns.push({ name, type });
    }

    date(name) {
        this.columns.push({ name, type: 'DATE' });
    }

    datetime(name) {
        this.columns.push({ name, type: 'DATETIME' });
    }

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
        return this.columns.map(col => `${col.name} ${col.type}`).join(', ');
    }

    // ALTER TABLE methods for adding, dropping, changing, and renaming columns
    addColumn(name, type) {
        this.alterOperations.push(`ADD COLUMN ${name} ${type}`);
    }

    dropColumn(name) {
        this.alterOperations.push(`DROP COLUMN ${name}`);
    }

    changeColumn(name, newType) {
        this.alterOperations.push(`CHANGE COLUMN ${name} ${newType}`);
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
