const Model = require("./Model");
const Hash = require("../../libraries/Services/Hash");

class Authenticatable extends Model {
    static authenticatableClass = true;

    static username() {
        return 'email'; // Default username field for authentication
    }

    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    static validatePhoneNumber(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    }
}

module.exports = Authenticatable;