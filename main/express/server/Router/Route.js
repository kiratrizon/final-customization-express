const path = require("path");
const RouteGroup = require('./RouteHandlers/group');
const RouteMethod = require('./RouteHandlers/method');
class Route {
    static #routeId = 0;
    static #groupId = 0;
    static #storedControllers = {};
    static #currentGroup = [];
    static #groupPreference = {};
    static #methodPreference = {};
    static #defaultRoute = {
        get: [],
        post: [],
        put: [],
        delete: [],
        patch: [],
        options: [],
        head: [],
        all: []
    }

    static view(path, viewName, data) {
        const buildView = (viewName, data) => view(viewName, data);
        return Route.get(path, buildView.bind(null, viewName, data));
    }

    static #handlerProcessor(handler, method) {
        let callback;
        if (is_array(handler)) {
            const controller = handler[0];
            const action = handler[1];
            const controllerName = controller.name;
            if (!this.#storedControllers[controllerName]) {
                this.#storedControllers[controllerName] = new controller();
            }
            const instanced = this.#storedControllers[controllerName];
            if (!method_exist(instanced, action)) {
                throw new Error(`Method ${action} not found in controller ${controllerName}`);
            }

            callback = instanced[action].bind(instanced)
        } else if (is_function(handler)) {
            callback = handler;
        }
        if (!callback) throw new Error(`Invalid Route.${method} handler`);
        return callback;
    }

    static #processRoute(url, handler, method, hasMatch = false) {
        let callback = Route.#handlerProcessor(handler, method);
        const config = {
            method, url, callback, currentGroup: Route.#groupCombiner(), hasMatch
        }
        const methodInstance = new RouteMethod(config);
        Route.#routeId++;
        const routeId = Route.#routeId;
        Route.#methodPreference[routeId] = methodInstance;
        if (empty(Route.#groupCombiner()) && empty(Route.#currentGroup)) {
            Route.#defaultRoute[method].push(routeId);
        } else if (!empty(Route.#groupCombiner()) && !empty(Route.#currentGroup)) {
            Route.#groupPreference[Route.#groupCombiner()].pushRoute(method, routeId);
        }
        return Route.#methodPreference[routeId];
    }

    static #groupCombiner() {
        // get from group preference
        const groups = Route.#currentGroup;
        let convertion = path.join(...groups);
        if (convertion === '.') {
            convertion = '';
        }
        return convertion;
    }

    static group(config = {}, callback) {
        Route.#groupId++;
        const groupId = Route.#groupId;
        const currentGroup = Route.#currentGroup;
        const groupInstance = new RouteGroup(config);
        const { prefix = null } = config;
        if (!isset(prefix)) {
            Route.#currentGroup = [...currentGroup, `*${groupId}*`];
        } else {
            Route.#currentGroup = [...currentGroup, prefix];
        }
        Route.#groupPreference[Route.#groupCombiner()] = groupInstance;
        if (is_function(callback)) {
            callback();
        }
        Route.#currentGroup = currentGroup;
    }

    static get(url, handler) {
        const method = 'get';
        return Route.#processRoute(url, handler, method);
    }

    static post(url, handler) {
        const method = 'post';
        return Route.#processRoute(url, handler, method);
    }
    static put(url, handler) {
        const method = 'put';
        return Route.#processRoute(url, handler, method);
    }
    static delete(url, handler) {
        const method = 'delete';
        return Route.#processRoute(url, handler, method);
    }
    static patch(url, handler) {
        const method = 'patch';
        return Route.#processRoute(url, handler, method);
    }

    static options(url, handler) {
        const method = 'options';
        return Route.#processRoute(url, handler, method);
    }
    static head(url, handler) {
        const method = 'head';
        return Route.#processRoute(url, handler, method);
    }

    static all(url, handler) {
        const method = 'all';
        return Route.#processRoute(url, handler, method);
    }


    static match(methods = [], url, handler) {
        if (!is_array(methods) || methods.length === 0) {
            throw new Error('Methods must be an array');
        }
        methods = methods.map((method) => {
            if (is_string(method)) {
                return method.toLowerCase();
            }
            return method;
        });
        const firstKey = methods.shift();
        return Route.#processRoute(url, handler, firstKey, methods);
    }

    // instantiated
    reveal() {
        let data = {
            default_route: Route.#defaultRoute,
            group: Route.#groupPreference,
            routes: Route.#methodPreference,
        };
        this.#reset();
        return data;
    }

    #reset() {
        Route.#currentGroup = [];
        Route.#storedControllers = {};
        Route.#currentGroup = [];
        Route.#groupPreference = {};
        Route.#methodPreference = {};
        Route.#defaultRoute = {
            get: [],
            post: [],
            put: [],
            delete: [],
            patch: [],
            options: [],
            head: [],
            all: []
        }
    }
}

module.exports = Route;