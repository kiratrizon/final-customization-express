const Model = require("./Model");
const Hash = require("../../libraries/Services/Hash");

class Authenticatable extends Model {
    static authenticatableClass = true;
    static async create(data) {
        data['password'] = await Hash.make(data['password']);
        delete data['password_confirmation'];
        return await super.create(data);
    }
    getAuthIdentifier() {
        return this.getAuthIdentifierName() ? this[this.getAuthIdentifierName()] : null;
    }
    getAuthPassword() {
        return this.password;
    }
    getAuthIdentifierName() {
        return super.getIdentifier();
    }
}

module.exports = Authenticatable;