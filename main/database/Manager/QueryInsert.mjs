class QueryInsert {
    constructor(table, data = [], dbType = 'sqlite') {
        this.table = table;
        this.data = data;
        this.dbType = dbType;
    }

    build() {
        const columns = [...new Set(this.data.flatMap(row => Object.keys(row)))];

        const placeholders = this.data.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');

        const values = this.data.flatMap(row => columns.map(col => row[col] ?? null));

        const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES ${placeholders}`;

        return { sql, values };
    }

}

export default QueryInsert;
