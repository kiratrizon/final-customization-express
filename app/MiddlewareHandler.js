const JWTMiddleware = require("../main/express/defaults/middleware/jwt-middleware");
const Hello = require("./Middlewares/Hello");
const Test = require("./Middlewares/Test");

class MiddlewareHandler {

    middlewareAliases() {
        return {
            "test": Test,
            "hello": Hello
        };
    }


    #middleware() {
        // middleware name => [DefaultMiddleware, guard]
        return {
            'user': [JWTMiddleware, 'jwt_user'],
            'admin': [JWTMiddleware, 'jwt_admin'],
        };
    }

    getMiddleware(name) {
        const middleware = this.#middleware()[name];
        if (middleware) {
            return new middleware[0](middleware[1]);
        }
        const alias = this.middlewareAliases()[name];
        if (alias) {
            return alias;
        }
        return null;
    }
}

module.exports = MiddlewareHandler;