import path from 'path';
import RouteGroup from './RouteHandlers/group.mjs';
import RouteMethod from './RouteHandlers/method.mjs';

import Controller from '../../../base/Controller.mjs';


function isClassInheritsFrom(child, parent) {
    let prototype = Object.getPrototypeOf(child);
    while (prototype) {
        if (prototype === parent) {
            return true;
        }
        prototype = Object.getPrototypeOf(prototype);
    }
    return false;
}
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
            if (!isClassInheritsFrom(controller, Controller)) {
                throw new Error(`Controller ${controller.name} must extend Controller class`);
            }
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
        const urlProps = Route.#processString(url);
        let callback = Route.#handlerProcessor(handler, method);
        const config = {
            method, urlProps, callback, groupProps: Route.#groupCombiner(), hasMatch
        }
        const methodInstance = new RouteMethod(config);
        Route.#routeId++;
        const routeId = Route.#routeId;
        Route.#methodPreference[routeId] = methodInstance;
        if (empty(Route.#groupCombiner().string) && empty(Route.#currentGroup)) {
            Route.#defaultRoute[method].push(routeId);
        } else if (!empty(Route.#groupCombiner().string) && !empty(Route.#currentGroup)) {
            Route.#groupPreference[Route.#groupCombiner().string].pushRoute(method, routeId);
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
        return Route.#processString(convertion);
    }

    static #processString(input) {
        const requiredParams = [];
        const optionalParams = [];
        if (input === '' || input === '/') {
            return { string: input, requiredParams, optionalParams };
        }
        const regex = {
            digit: /^\d+$/,
            alpha: /^[a-zA-Z]+$/,
            alphanumeric: /^[a-zA-Z0-9]+$/,
            slug: /^[a-z0-9-]+$/,
            uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        };
        // Step 1: Replace multiple slashes with a single slash
        input = input.replace(/\/+/g, '/');

        if (input.startsWith('/')) {
            input = input.slice(1); // Remove leading slash
        }
        if (input.endsWith('/')) {
            input = input.slice(0, -1); // Remove trailing slash
        }
        // Step 2: Split the string by slash
        const parts = input.split('/');

        const result = parts.map(part => {
            const constantPart = part;
            if (part.startsWith('{') && part.endsWith('}')) {
                // Handle part wrapped in {}
                let isOptional = false;
                part = part.slice(1, -1); // Remove curly braces

                // Check if it's optional
                if (part.endsWith('?')) {
                    part = part.slice(0, -1); // Remove the '?' character
                    isOptional = true;
                }

                // If it's an alpha string, handle it
                if (regex.alphanumeric.test(part)) {
                    if (isOptional) {
                        optionalParams.push(part);
                        return `{:${part}}`; // Optional, wrapped with ":"
                    } else {
                        requiredParams.push(part);
                        return `:${part}`; // Non-optional, just with ":"
                    }
                }

                throw new Error(`${JSON.stringify(constantPart)} is not a valid parameter name`);
            } else {
                if (regex.digit.test(part)) {
                    return `${part}`;
                }
                if (regex.alpha.test(part)) {
                    return `${part}`;
                }
                if (regex.alphanumeric.test(part)) {
                    return `${part}`;
                }
                if (regex.slug.test(part)) {
                    return `${part}`;
                }
                if (regex.uuid.test(part)) {
                    return `${part}`;
                }

                if (part.startsWith('*') && part.endsWith('*')) {
                    const type = part.slice(1, -1); // remove * *

                    if (regex.digit.test(type)) {
                        return `${part}`;
                    }
                }
                throw new Error(`${constantPart} is not a valid route`);
            }
        });
        let modifiedString = `/${path.join(...result)}`;
        if (modifiedString.endsWith('/') && modifiedString.length > 1) {
            modifiedString = modifiedString.slice(0, -1).replace(/\/\{/g, '{/'); // Remove trailing slash
        } else {
            modifiedString = modifiedString.replace(/\/\{/g, '{/');
        }
        return { string: modifiedString, requiredParams, optionalParams };
    }

    static group(config = {}, callback) {
        if (!is_object(config)) {
            throw new Error('Config must be an object');
        }
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
        Route.#groupPreference[Route.#groupCombiner().string] = groupInstance;
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

export default Route;