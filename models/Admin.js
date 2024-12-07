const Authenticatable = require("../main/base/Authenticatable");

class Admin extends Authenticatable {
    fillable = [
        'name',
        'email',
        'password'
    ];
    hidden = [
        'password'
    ];
};

module.exports = Admin;