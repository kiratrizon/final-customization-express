const Authenticatable = require("../main/base/Authenticatable");

class Admin extends Authenticatable {
    static factory = true;
    static softDelete = true;


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