const Authenticatable = require("../main/base/Authenticatable");

class User extends Authenticatable {
    fillable = [
        'name',
        'email',
        'password'
    ];
};

module.exports = User;