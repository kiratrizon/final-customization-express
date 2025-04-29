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
};

module.exports = User;