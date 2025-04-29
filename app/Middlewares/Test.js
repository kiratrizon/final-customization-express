const Auth = require("../../main/express/server/Auth");

class Test {

    static async handle(request, next) {
        // your middleware logic here
        if (!Auth.check()) {
            return 'hello';
        }
        return next(request);
    }
}

module.exports = Test;