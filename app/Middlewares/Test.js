const Auth = require("../../main/express/server/Auth");

class Test {

    static async handle(request, next) {
        // your middleware logic here
        if (!Auth.check()) {
            return response().json({ message: 'Unauthorized' }, 401);
        }
        return next(request);
    }
}

module.exports = Test;