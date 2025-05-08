import JWTMiddleware from "../main/express/defaults/middleware/jwt-middleware.mjs";
import Hello from "./Middlewares/Hello.mjs";


class MiddlewareHandler {

    middlewareAliases() {
        return {
            "hello": Hello
        };
    }


    #middleware() {
        /**
         * @type {Object.<string, [typeof import('../main/express/defaults/middleware/jwt-middleware.mjs').default, string]>}
         */
        const middleware = {
            'user': [JWTMiddleware, 'jwt_user'],
            'admin': [JWTMiddleware, 'jwt_admin'],
        };
        return middleware;
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