const MiddlewareHandler = require('../../../app/MiddlewareHandler');
const expressRouter = require('express').Router();

class Route {
    static #prefix = '/';

    static #storedController = {};
    static #currentUrl = '';
    static #currentMethod = '';
    static #groupResource = '';
    static #middlewareArr = [];
    static #storedMethodRoutes = {
        "get": {},
        "post": {},
        "put": {},
        "delete": {},
        "patch": {},
    };
    static #currentAs = '';
    static #middlewareHandler = new MiddlewareHandler();
    #newStoredMethodRoutes;
    #newPrefix;
    constructor() {
        this.#newStoredMethodRoutes = Route.#storedMethodRoutes;
        this.#newPrefix = Route.#prefix;
        this.mainRouter = expressRouter;
    }
    static setPrefix(prefix) {
        Route.#prefix = prefix;
        Route.mainRouter = expressRouter;
        Route.#storedController = {};
        Route.#currentUrl = '';
        Route.#currentMethod = '';
        Route.#groupResource = '';
        Route.#middlewareArr = [];
        Route.#storedMethodRoutes = {
            "get": {},
            "post": {},
            "put": {},
            "delete": {},
            "patch": {},
        };
        Route.#currentAs = '';
    }
    getPrefix() {
        return this.#newPrefix;
    }
    static #handleRoutes(method, url, args) {
        // if (!url.startsWith('/')) {
        //     throw new Error(`Route.${method}('must start with a forward slash')`);
        // }
        Route.#reset();
        // Prepend the group resource prefix to the URL
        url = `${Route.#groupResource}${url}`.replace(/\/+/g, '/'); // Ensure no double slashes

        let newOpts;
        let finalConvertion;
        let instanced;
        let isControllerInstance = false;
        let actionMethod;
        let [controller, action] = [];
        if (Array.isArray(args)) {
            [controller, action] = args;
            if (!Route.#storedController[controller.name]) {
                Route.#storedController[controller.name] = new controller();
            }
            instanced = Route.#storedController[controller.name];
            actionMethod = instanced[action];
            if (typeof actionMethod === 'function') {
                isControllerInstance = true;
                finalConvertion = actionMethod;
            } else {
                throw new Error(`The method "${action}" does not exist in the controller "${controller.name}"`);
            }
        } else if (args !== undefined && typeof args === 'function') {
            finalConvertion = args;
        } else {
            finalConvertion = null;
        }

        if (finalConvertion !== undefined && typeof finalConvertion === 'function') {
            newOpts = (req, res) => {
                if (isControllerInstance){
                    return instanced[action](...Object.values(REQUEST.params));
                }
                return finalConvertion(...Object.values(REQUEST.params));
            };
        } else {
            newOpts = undefined;
        }

        if (newOpts !== undefined) {
            if (!Route.#storedMethodRoutes[method][url]) {
                Route.#storedMethodRoutes[method][url] = {};
            }
            Route.#storedMethodRoutes[method][url]['function_use'] = newOpts;
            Route.#currentUrl = url;
            Route.#currentMethod = method;
            if (Route.#middlewareArr.length) {
                Route.#middlewareArrHandler(Route.#middlewareArr);
            }
            if (Route.#currentAs !== '') {
            }
            Route.name(Route.#currentAs);
        }
    }


    static name(name) {
        if (Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'] !== undefined && Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'].endsWith('.')) {
            Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'] += name;
        } else {
            Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'] = name;
        }
        return Route;
    }
    static #resourceNaming(name) {
        Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'] = name;
        return Route;
    }
    static middleware(middlewareName) {
        let functionUsed;
        let middleware;
        if (!Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['middlewares']) {
            Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['middlewares'] = [];
        }
        const handlers = Route.#middlewareHandler.middlewareAliases();
        if (typeof middlewareName === 'string' && middlewareName !== '' && handlers.hasOwnProperty(middlewareName)) {
            const testMiddleware = handlers[middlewareName]['handle'];
            if (typeof testMiddleware === 'function') {
                functionUsed = testMiddleware;
            }
        } else if (typeof middlewareName === 'function') {
            functionUsed = middlewareName;
        }
        if (typeof functionUsed === 'function') {
            middleware = (req, res, next) => {
                functionUsed(next);
            }
        }
        if (typeof middleware === 'function') {
            Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['middlewares'].unshift(middleware);
        }
        return Route;
    }

    static #reset() {
        Route.#currentUrl = '';
        Route.#currentMethod = '';
    }

    static get(url, args) {
        Route.#handleRoutes('get', url, args);
        return Route;
    }
    static post(url, args) {
        Route.#handleRoutes('post', url, args);
        return Route;
    }
    static put(url, args) {
        Route.#handleRoutes('put', url, args);
        return Route;
    }
    static delete(url, args) {
        Route.#handleRoutes('delete', url, args);
        return Route;
    }
    static patch(url, args) {
        Route.#handleRoutes('patch', url, args);
        return Route;
    }

    getStoredRoutes() {
        return this.#newStoredMethodRoutes;
    }

    static resource(resource, controller, args = {}) {
        const { only = [], middleware = '' } = args;
        if (resource === '/') {
            throw new Error("The root resource cannot be named.");
        }
        do {
            resource = resource.substring(1);
        } while (resource.charAt(0) === '/');
        let naming = resource == '' ? '' : `${resource}`;
        let as = Route.#currentAs == '' ? '' : `${Route.#currentAs}`;
        let combine = `${as}${naming}`;
        const resources = {
            index: "Route.get(`${resource == '' ? resource : `/${resource}`}`, [controller, 'index']).#resourceNaming(`${combine}.index`).middleware(middleware)",
            create: "Route.get(`${resource == '' ? resource : `/${resource}`}/create`, [controller, 'create']).#resourceNaming(`${combine}.create`).middleware(middleware)",
            store: "Route.post(`${resource == '' ? resource : `/${resource}`}`, [controller, 'store']).#resourceNaming(`${combine}.store`).middleware(middleware)",
            show: "Route.get(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'show']).#resourceNaming(`${combine}.show`).middleware(middleware)",
            edit: "Route.get(`${resource == '' ? resource : `/${resource}`}/:id/edit`, [controller, 'edit']).#resourceNaming(`${combine}.edit`).middleware(middleware)",
            update: "Route.put(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'update']).#resourceNaming(`${combine}.update`).middleware(middleware)",
            destroy: "Route.delete(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'destroy']).#resourceNaming(`${combine}.destroy`).middleware(middleware)",
        }
        if (!only.length) {
            Object.entries(resources).forEach(([key, value]) => {
                eval(value);
            });
        } else {
            only.forEach((key) => {
                eval(resources[key]);
            });
        }
        return Route;
    }

    static group(opts, callback) {
        let resource = opts.prefix.replace(/^\/+/, ''); // Simplified leading slash removal

        if (!opts.as || opts.as === '') {
            throw new Error("The 'as' property is required when defining a route group.");
        }

        const originalMiddleware = Route.#middlewareArr.slice();
        const originalPrefix = Route.#groupResource;
        const originalAs = Route.#currentAs;

        // Set the group resource prefix
        Route.#groupResource = `${originalPrefix}/${resource}`.replace(/\/+/g, '/');

        // Apply the group 'as' prefix
        Route.#currentAs = `${originalAs}${opts.as}.`;

        // Add middleware if defined in the group options
        if (opts.middleware) {
            if (Array.isArray(opts.middleware)) {
                Route.#middlewareArr.unshift(...opts.middleware);
            } else {
                Route.#middlewareArr.unshift(opts.middleware);
            }
        }

        // Run the callback to register routes inside the group
        callback();

        // Restore original state after callback
        Route.#middlewareArr = originalMiddleware;
        Route.#groupResource = originalPrefix;
        Route.#currentAs = originalAs;

        return Route;
    }

    static #middlewareArrHandler(array) {
        for (let middleware of array) {
            Route.middleware(middleware);
        }
    }
}

module.exports = Route;