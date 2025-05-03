import Model from "./Model.mjs";


class Authenticatable extends Model {
    getAuthIdentifierName() {
        return 'id';
    }

    getAuthIdentifier() {
        return this[this.getAuthIdentifierName()];
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

export default Authenticatable;