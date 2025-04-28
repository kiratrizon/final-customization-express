const Auth = require("../../main/express/server/Auth");

class Test {

    static async handle(request, next) {
        // your middleware logic here
        if (request.is('post')) {
            return 'hello';
        }
        return next();
    }
}

module.exports = Test;