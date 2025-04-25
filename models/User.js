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


    // Default username field for authentication methods
    static username() {
        if (this.validateEmail(request('email'))) {
            return 'email';
        }
        if (this.validatePhoneNumber(request('phone'))) {
            return 'phone';
        }
        return 'username';
    }
};

module.exports = User;