const Test = require("./Middlewares/Test");

class MiddlewareHandler {

    middlewareAliases() {
        return {
            "test": Test
        };
    }
}

module.exports = MiddlewareHandler;