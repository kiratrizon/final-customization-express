import JWTMiddleware from "../main/express/defaults/middleware/jwt-middleware.mjs";
import Hello from "./Middlewares/Hello.mjs";


class MiddlewareHandler {

    middlewareAliases() {
        return {
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

export default MiddlewareHandler;