const Authenticatable = require("../main/base/Authenticatable");

class User extends Authenticatable {
    static factory = true;

    fillable = [
        'name',
        'email',
        'password'
    ];
    hidden = [
        'password'
    ];

    getUsername() {
        return 'email';
    }

    getJWTIdentifier() {
        return this.getAuthIdentifierName();
    }

    getJWTCustomClaims() {
        return {
            'sub': this.id,
            'email': this.email,
        };
    }
};

module.exports = User;