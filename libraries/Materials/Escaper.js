const Database = require("../../main/database/Database")

const database = new Database();

class Escaper {
    static resolve(value) {
        return database.escape(value);
    }
}

module.exports = Escaper;