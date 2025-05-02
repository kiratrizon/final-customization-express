const Model = require("./Model");

class Authenticatable extends Model {
    getAuthIdentifierName() {
        return 'id';
    }

    getAuthIdentifier() {
        return this[getAuthIdentifierName()];
    }

    getAuthPassword() {
        return this.password;
    }

    getRememberToken() {
        return this.remember_token;
    }

    setRememberToken(token) {
        this.remember_token = token;
    }

    getRememberTokenName() {
        return 'remember_token';
    }

}

module.exports = Authenticatable;