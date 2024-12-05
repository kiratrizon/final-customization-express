const Auth = require("../../main/express/server/Auth");

class Test {

    static async handle(next) {
        // your middleware logic here
        const checker = await Auth.check();
        if (!checker){
            return jsonResponse({ message: "Unauthorized" }, 401);
        }
        next();
    }
}

module.exports = Test;