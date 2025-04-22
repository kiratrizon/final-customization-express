const express = require("express");
const MiddlewareHandler = require('../../../../app/MiddlewareHandler');
const ExpressRedirect = require('../../http/ExpressRedirect');
const ExpressResponse = require('../../http/ExpressResponse');
const ExpressClosure = require('../../http/ExpressClosure');


const path = require("path");
class Route {
    static #routeId = 0;
    static #routeValue = {};
    static #owner = 'method';
    static #storedControllers = {};

    static #currentGroup = [];
    static #routers = {};
    static #currentName = [];

    // store route
    static #processMethods(method, path, callback) {
        Route.#routeId++;
        const id = Route.#routeId;
        let newCallback = null;
        if (is_function(callback)) {
            newCallback = async (req, res) => {
                if (res.headersSent) {
                    return;
                }
                const expressResponse = await callback(...Object.values(request.request.params));
                if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressRedirect)) {
                    if (expressResponse instanceof ExpressResponse) {
                        const { html, json, headers, statusCode, returnType } = expressResponse.accessData();
                        if (returnType === 'html') {
                            res.status(statusCode);
                            res.set(headers);
                            res.send(html);
                        } else if (returnType === 'json') {
                            res.status(statusCode);
                            res.set(headers);
                            res.json(json);
                        }
                    } else if (expressResponse instanceof ExpressRedirect) {
                        const { url, statusCode } = expressResponse;
                        res.redirect(statusCode, url);
                    }
                }
                else {
                    res.status(200);
                    res.set('Content-Type', isRequest() ? 'application/json' : 'text/html');
                    if (isRequest()) {
                        res.json(expressResponse);
                    }
                    else {
                        res.send(expressResponse);
                    }
                }
                return;
            }
        }
        if (is_function(newCallback)) {
            const group = Route.#getCombinedGroupOrName();
            Route.#routeValue[id] = {
                id,
                method,
                path,
                newCallback,
                internal_middlewares: [],
                group,
            }
            // validate if group is set
            Route.#validateRoute(group);
            Route.#routers[group][method].push(id);
        }
        Route.#setOwner('method');
        return Route;
    }

    static get(path, handler) {
        let callback;
        if (is_array(handler)) {
            const controller = handler[0];
            const method = handler[1];
            const controllerName = controller.name;
            if (!this.#storedControllers[controllerName]) {
                this.#storedControllers[controllerName] = new controller();
            }
            const instanced = this.#storedControllers[controllerName];
            if (!method_exist(instanced, method)) {
                throw new Error(`Method ${method} not found in controller ${controllerName}`);
            }

            callback = instanced[method].bind(instanced)
        }

        Route.#processMethods('get', path, callback);
        return Route;
    }

    static #setOwner(owner) {
        Route.#owner = owner;
    }
    static #getCombinedGroupOrName(defaultCombine = 'group') {
        let combined = '';
        if (defaultCombine === 'group') {
            const currentGroup = Route.#currentGroup;
            if (currentGroup.length) {
                combined = path.join(...currentGroup);
            } else {
                combined = 'application_default';
            }
            if (combined === '.') {
                combined = '';
            }
        } else if (defaultCombine === 'name') {
            const currentName = Route.#currentName.map((nama) => {
                nama = nama.replace(/\./g, '');
                return nama.toLowerCase();
            });
            if (currentName.length) {
                combined = path.join(...currentName);
            }
            if (combined === '.') {
                combined = '';
            }
            // replace all / with .
            combined = combined.replace(/\//g, '.');
        }
        return combined;
    }

    static group(properties = {}, callback) {
        const { prefix = '', middleware, as = '' } = properties;
        Route.#setOwner('group');
        const currentGroup = Route.#currentGroup;
        Route.#currentGroup = [...currentGroup, prefix];
        if (isset(middleware)) {
            Route.middleware(middleware);
        }
        const currentName = Route.#currentName;
        if (isset(as) && is_string(as)) {
            Route.#currentName = [...currentName, as];
        }
        if (is_function(callback)) {
            callback();
        }
        Route.#currentGroup = currentGroup;
        Route.#currentName = currentName;
    }

    static middleware(handler) {
        const id = Route.#routeId;
        const owner = Route.#owner;
        let middleware;
        if (isset(handler)) {
            if (is_array(handler)) {
                handler.forEach(element => {
                    Route.middleware(element);
                });
            } else if (is_string(handler)) {
                const middlewareHandler = new MiddlewareHandler();
                const middlewareAliases = middlewareHandler.middlewareAliases();
                if (isset(middlewareAliases[handler])) {
                    const classUsed = middlewareAliases[handler];
                    if (method_exist(classUsed, 'handle') && is_function(classUsed.handle)) {
                        middleware = classUsed.handle;
                    }
                }
            } else if (is_function(handler)) {
                middleware = handler;
            }
        }
        if (isset(middleware) && is_function(middleware)) {
            const newCallback = async (req, res, next) => {
                if (res.headersSent) {
                    return;
                }
                const middlewareInitiator = () => {
                    return new ExpressClosure();
                }
                const expressResponse = await middleware(middlewareInitiator);
                if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressRedirect || expressResponse instanceof ExpressClosure)) {
                    if (expressResponse instanceof ExpressResponse) {
                        const { html, json, headers, statusCode, returnType } = expressResponse.accessData();
                        if (returnType === 'html') {
                            res.status(statusCode);
                            res.set(headers);
                            res.send(html);
                        } else if (returnType === 'json') {
                            res.status(statusCode);
                            res.set(headers);
                            res.json(json);
                        }
                    } else if (expressResponse instanceof ExpressRedirect) {
                        const { url, statusCode } = expressResponse;
                        res.redirect(statusCode, url);
                    } else if (expressResponse instanceof ExpressClosure) {
                        if (expressResponse.next) {
                            next();
                        }
                    }
                }
                else {
                    res.status(200);
                    res.set('Content-Type', isRequest() ? 'application/json' : 'text/html');
                    if (isRequest()) {
                        res.json(expressResponse);
                    }
                    else {
                        res.send(expressResponse);
                    }
                }
                return;
            }
            if (owner === 'method') {
                Route.#routeValue[id].internal_middlewares.push(newCallback);
            } else if (owner === 'group') {
                const group = Route.#getCombinedGroupOrName();
                Route.#validateRoute(group);
                Route.#routers[group]['middlewares'].push(newCallback);
            }
        }
        return Route;
    }

    static name(param) {
        const id = Route.#routeId;
        const currentName = Route.#currentName;
        if (is_string(param)) {
            Route.#currentName = [...currentName, param];
        }
        const name = Route.#getCombinedGroupOrName('name');
        Route.#currentName = currentName;
        Route.#routeValue[id].as = name;
        return Route;
    }

    static #validateRoute(currentGroup) {
        if (!Route.#routers[currentGroup]) {
            Route.#routers[currentGroup] = {};
            Route.#routers[currentGroup]['middlewares'] = [];
            // all methods
            Route.#routers[currentGroup]['get'] = [];
            Route.#routers[currentGroup]['post'] = [];
            Route.#routers[currentGroup]['put'] = [];
            Route.#routers[currentGroup]['delete'] = [];
            Route.#routers[currentGroup]['patch'] = [];
            Route.#routers[currentGroup]['options'] = [];
            Route.#routers[currentGroup]['head'] = [];
        }
    }

    constructor() {
    }

    reveal() {
        let data = {
            routeValue: Route.#routeValue,
            routers: Route.#routers,
        };
        this.reset();
        return data;
    }

    reset() {
        // Route.#routeId = 0;
        Route.#routeValue = {};
        Route.#owner = 'method';
        Route.#storedControllers = {};

        Route.#currentGroup = [];
        Route.#routers = {};
        Route.#currentName = [];
    }
}

module.exports = Route;