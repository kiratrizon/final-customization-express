import RouteMiddleware from './middleware.mjs';


class RouteGroup {

    #as = [];
    #middlewares = [];
    #childRoutes = {
        get: [],
        post: [],
        options: [],
        put: [],
        delete: [],
        head: [],
        patch: [],
        all: [],
    };
    constructor(config = {}) {
        const { as = null, middleware } = config;
        this.#name(as);
        this.#middleware(middleware);
    }

    #name(name = '') {
        if (is_string(name) && name.length) this.#as.push(name);
        return this;
    }

    #middleware(handler) {
        let generateMiddleware = new RouteMiddleware(handler);
        let result = generateMiddleware.getMiddlewares();
        this.#middlewares = [...this.#middlewares, ...result];
    }

    getGroup() {
        return {
            as: this.#as,
            middlewares: this.#middlewares,
            childRoutes: this.#childRoutes,
        };
    }
    pushRoute(method, id) {
        if (!empty(id)) {
            this.#childRoutes[method].push(id);
        }
    }
}

export default RouteGroup;