const Hello = require("./Middlewares/Hello");
const Test = require("./Middlewares/Test");

class MiddlewareHandler {

    middlewareAliases() {
        return {
            "test": Test,
            "hello": Hello
        };
    }
}

module.exports = MiddlewareHandler;