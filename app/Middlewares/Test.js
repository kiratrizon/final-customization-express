const Auth = require("../../main/express/server/Auth");

class Test {

    static handle(next) {
        // your middleware logic here
        if (!Auth.guard('user').check()) {
            return redirect().route('login');
        }
        next();
    }
}

module.exports = Test;