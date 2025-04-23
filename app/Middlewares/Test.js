const Auth = require("../../main/express/server/Auth");

class Test {

    static async handle(request, next) {
        // your middleware logic here
        if (false) {
            return redirect().route('login');
        }
        return next();
    }
}

module.exports = Test;