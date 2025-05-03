import Database from "../../main/database/Manager/DatabaseManager.mjs";

const database = new Database();

class Escaper {
    static resolve(value) {
        return database.escape(value);
    }
}

export default Escaper;