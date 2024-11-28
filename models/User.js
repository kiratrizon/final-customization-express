const Authenticatable = require("../main/express/server/Authenticatable");

class User extends Authenticatable {
    fillable = [
        'name',
        'email',
        'password'
    ];
};

module.exports = User;