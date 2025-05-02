const Database = require("../../main/database/Manager/DatabaseManager");

const database = new Database();

class Escaper {
    static resolve(value) {
        return database.escape(value);
    }
}

export default Escaper;