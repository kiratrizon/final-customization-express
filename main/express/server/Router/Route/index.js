const MiddlewareHandler = require('../../../../../app/MiddlewareHandler');
const ExpressRedirect = require('../../../http/ExpressRedirect');
const ExpressResponse = require('../../../http/ExpressResponse');
const ExpressClosure = require('../../../http/ExpressClosure');
const ExpressRequest = require('../../../http/ExpressRequest');
const ExpressView = require('../../../http/ExpressView');


const path = require("path");
class Route {
    static #routeId = 0;
    static #routeValue = {};
    static #owner = 'method';
    static #storedControllers = {};
    static #groupId = 0;
    static #currentGroup = [];
    static #routers = {};
    static #currentName = [];

    // store route
    static #processMethods(method, cpath, callback) {
        Route.#routeId++;
        const id = Route.#routeId;
        let newCallback = null;
        const currentGroup = Route.#getCombinedGroupOrName('group');
        const pathCheckerForRegex = currentGroup + cpath;
        if (is_function(callback)) {
            newCallback = async (req, res) => {
                $_POST = req.body || {};
                $_GET = req.query || {};
                $_FILES = req.files || {};
                $_COOKIE = req.cookies || {};
                const methodType = req.method.toUpperCase();
                const REQUEST = {
                    method: methodType,
                    params: { ...req.params },
                    headers: req.headers,
                    body: $_POST,
                    query: $_GET,
                    cookies: $_COOKIE,
                    path: req.path,
                    originalUrl: req.originalUrl,
                    ip: req.ip,
                    protocol: req.protocol,
                    files: $_FILES,
                };
                const rq = new ExpressRequest(REQUEST);
                PATH_URL = REQUEST.path;
                QUERY_URL = REQUEST.originalUrl;
                ORIGINAL_URL = `${BASE_URL}${QUERY_URL}`;
                const regex = /{\/?:([\w-]+)\??}|:(\w+)/g;

                const keys = [];
                let match;

                while ((match = regex.exec(pathCheckerForRegex)) !== null) {
                    const key = match[1] ?? match[2]; // nullish coalescing
                    if (key) keys.push(key);
                }

                const params = {};
                keys.forEach((key) => {
                    params[key] = rq.request.params[key] || null;
                })
                const expressResponse = await callback(rq, ...Object.values(params));
                const responsesOfRes = res.responses;
                // console.log(responsesOfRes);
                if (res.headersSent) {
                    return;
                }
                if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressRedirect || expressResponse instanceof ExpressView)) {
                    if (expressResponse instanceof ExpressResponse) {
                        const { html, json, headers, statusCode, returnType } = expressResponse.accessData();
                        if (returnType === 'html') {
                            responsesOfRes.push(html);
                            res.status(statusCode || 200);
                            res.set(headers);
                            res.send(responsesOfRes.join(''));
                        } else if (returnType === 'json') {
                            res.status(statusCode);
                            res.set(headers);
                            res.json(json);
                        }
                    } else if (expressResponse instanceof ExpressRedirect) {
                        const { url, statusCode } = expressResponse;
                        res.redirect(statusCode, url);
                    } else if (expressResponse instanceof ExpressView) {
                        res.status(200);
                        res.set('Content-Type', 'text/html');
                        const rendered = expressResponse.getRendered();
                        responsesOfRes.push(rendered);
                        if (rendered) {
                            res.send(responsesOfRes.join(''));
                        } else {
                            res.send(null);
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
                        responsesOfRes.push(expressResponse);
                        res.send(responsesOfRes.join(''));
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
                path: cpath,
                newCallback,
                internal_middlewares: [],
            }
            // validate if group is set
            Route.#validateRoute(group);
            Route.#routers[group][method].push(id);
        }
        Route.#setOwner('method');
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
            }
            if (combined === '.') {
                combined = '';
            }
            combined = combined.replace(/\/{2,}/g, '/').replace(/}(\/){/g, '}{');

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

    static #handlerProcessor(handler) {
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
        } else if (is_function(handler)) {
            callback = handler;
        }

        return callback;
    }

    static #isValidPrefix(prefix) {
        const validPattern = /^\/[^\s{}\/]+$|^\/:[^\s{}\/]+$|^{\/:[^\s{}\/]+}$/;
        return validPattern.test(prefix);
    }


    static group(properties = {}, callback) {
        let { prefix = '', middleware, as = '' } = properties;
        if (prefix === '') {
            Route.#groupId++;
            prefix = `*${Route.#groupId}*`;
        } else {
            if (!Route.#isValidPrefix(prefix)) {
                throw new Error(`Invalid prefix ${prefix}`);
            }
        }
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
                $_POST = req.body || {};
                $_GET = req.query || {};
                $_FILES = req.files || {};
                $_COOKIE = req.cookies || {};
                const methodType = req.method.toUpperCase();
                const REQUEST = {
                    method: methodType,
                    params: req.params,
                    headers: req.headers,
                    body: $_POST,
                    query: $_GET,
                    cookies: $_COOKIE,
                    path: req.path,
                    originalUrl: req.originalUrl,
                    ip: req.ip,
                    protocol: req.protocol,
                    files: $_FILES,
                };
                const rq = new ExpressRequest(REQUEST);
                PATH_URL = REQUEST.path;
                QUERY_URL = REQUEST.originalUrl;
                ORIGINAL_URL = `${BASE_URL}${QUERY_URL}`;
                const middlewareInitiator = () => {
                    return new ExpressClosure();
                }
                request = (getInput = '') => {
                    if (!is_string(getInput)) {
                        return rq;
                    } else {
                        return rq.input(getInput);
                    }
                }
                const expressResponse = await middleware(rq, middlewareInitiator);
                if (res.headersSent) {
                    return;
                }
                if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressRedirect || expressResponse instanceof ExpressClosure || expressResponse instanceof ExpressView)) {
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
                    } else if (expressResponse instanceof ExpressView) {
                        res.status(200);
                        res.set('Content-Type', 'text/html');
                        const rendered = expressResponse.getRendered();
                        if (rendered) {
                            res.send(rendered);
                        } else {
                            res.send(html);
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

    static get(path, handler) {
        let callback = Route.#handlerProcessor(handler);
        Route.#processMethods('get', path, callback);
        return Route;
    }
    static post(path, handler) {
        let callback = Route.#handlerProcessor(handler);
        Route.#processMethods('post', path, callback);
        return Route;
    }
    static put(path, handler) {
        let callback = Route.#handlerProcessor(handler);
        Route.#processMethods('put', path, callback);
        return Route;
    }
    static delete(path, handler) {
        let callback = Route.#handlerProcessor(handler);
        Route.#processMethods('delete', path, callback);
        return Route;
    }
    static patch(path, handler) {
        let callback = Route.#handlerProcessor(handler);
        Route.#processMethods('patch', path, callback);
        return Route;
    }
    static options(path, handler) {
        let callback = Route.#handlerProcessor(handler);
        Route.#processMethods('options', path, callback);
        return Route;
    }
    static head(path, handler) {
        let callback = Route.#handlerProcessor(handler);
        Route.#processMethods('head', path, callback);
        return Route;
    }
    static view(path, viewName, data) {
        const buildView = (viewName, data) => view(viewName, data);
        return Route.get(path, buildView.bind(null, viewName, data));
    }

    // instantiated
    reveal() {
        let data = {
            routeValue: Route.#routeValue,
            routers: Route.#routers,
        };
        this.#reset();
        return data;
    }

    #reset() {
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