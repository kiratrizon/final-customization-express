const MiddlewareHandler = require('../../../app/MiddlewareHandler');

class Route {
    static #prefix = '/';
    static setPrefix(pref){
        Route.#prefix = pref;
        Route.mainRouter = require('express').Router();
        Route.#storedRoutes = {};
    }
    static getPrefix(){
        return Route.#prefix;
    }
    static #currentName = '';
    static #storedRoutes = {};
    static mainRouter = require('express').Router();
    static #handleRequest(requestMethod, prefix, options) {

        const newRoute = require('express').Router();
        let newOpts;
        let finalConvertion;
        if (Array.isArray(options)) {
            const [controller, method] = options;
            const instanceofController = new controller();
            if (typeof instanceofController[method] === 'function') {
                finalConvertion = instanceofController[method];
            }
        } else if (typeof options === 'function') {
            finalConvertion = options;
        }
        if (finalConvertion !== undefined && typeof finalConvertion === 'function') {
            newOpts = (req, res) => {
                const type = {};
                let methodType = req.method.toLowerCase();
                if (methodType == 'post') {
                    type.post = req.body;
                } else if (methodType == 'get') {
                    type.get = req.query;
                } else if (methodType == 'put') {
                    type.put = req.body;
                }
                const data = {
                    request: {
                        method: methodType,
                        url: req.originalUrl,
                        params: req.params,
                        headers: req.headers,
                        body: req.body,
                        query: req.query,
                        [methodType]: type[methodType],
                        cookies: req.cookies,
                        path: req.path,
                        originalUrl: req.originalUrl,
                        ip: req.ip,
                        protocol: req.protocol,
                        user: req.user || null,
                        // route: req.route || null,
                        acceptLanguage: req.headers['accept-language'],
                        referer: req.headers['referer'] || null,
                        session: req.session || null,
                        files: req.files || null,
                        received: type[methodType],
                    }
                };
                const params = data.request.params;
                global.dd = (data) => dump(data, true);
                finalConvertion(req, res, data.request, data.request[methodType], ...Object.values(params));
            };
            newRoute[requestMethod](`${prefix}`, newOpts);
            Route.mainRouter.use(newRoute);
        }
    }

    static get(prefix, options) {
        Route.#handleRequest('get', prefix, options);
        Route.#currentName = prefix;
        return Route;
    }
    static post(prefix, options) {
        Route.#handleRequest('post', prefix, options);
        Route.#currentName = prefix;
        return Route;
    }
    static put(prefix, options) {
        Route.#handleRequest('put', prefix, options);
        Route.#currentName = prefix;
        return Route;
    }
    static delete(prefix, options) {
        Route.#handleRequest('delete', prefix, options);
        Route.#currentName = prefix;
        return Route;
    }
    static patch(prefix, options) {
        Route.#handleRequest('patch', prefix, options);
        Route.#currentName = prefix;
        return Route;
    }

    static group(opts = {}, callback) {
        const currentPrefix = opts.prefix || '';
        const currentMiddleware = opts.middleware || null;

        const originalMainRouter = Route.mainRouter;
        Route.mainRouter = require('express').Router();

        Route.#applyMiddleware(originalMainRouter, currentPrefix, currentMiddleware);

        callback();

        Route.mainRouter = originalMainRouter;
    }

    static #applyMiddleware(originalMainRouter, currentPrefix, currentMiddleware) {
        if (typeof currentMiddleware === 'string') {
            const middlewareHandler = new MiddlewareHandler().middlewareAliases();
            if (Object.keys(middlewareHandler).includes(currentMiddleware)) {
                const middlewareClass = middlewareHandler[currentMiddleware]?.handle;
                if (typeof middlewareClass === 'function') {
                    originalMainRouter.use(`${currentPrefix}`, middlewareClass, Route.mainRouter);
                } else {
                    originalMainRouter.use(`${currentPrefix}`, Route.mainRouter);
                }
            } else {
                originalMainRouter.use(`${currentPrefix}`, Route.mainRouter);
            }
        } else if (typeof currentMiddleware === 'function') {
            originalMainRouter.use(`${currentPrefix}`, currentMiddleware, Route.mainRouter);
        } else {
            originalMainRouter.use(`${currentPrefix}`, Route.mainRouter);
        }
    }

    static resource(resource, controller) {
        do {
            resource = resource.substring(1);
        } while (resource.charAt(0) === '/');
        Route.get(`${resource == '' ? resource : `/${resource}`}`, [controller, 'index']).name(`${resource}.index`);
        Route.get(`${resource == '' ? resource : `/${resource}`}/create`, [controller, 'create']).name(`${resource}.create`);
        Route.post(`${resource == '' ? resource : `/${resource}`}`, [controller, 'store']).name(`${resource}.store`);
        Route.get(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'show']).name(`${resource}.show`);
        Route.get(`${resource == '' ? resource : `/${resource}`}/:id/edit`, [controller, 'edit']).name(`${resource}.edit`); 
        Route.put(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'update']).name(`${resource}.update`);
        Route.delete(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'destroy']).name(`${resource}.destroy`);
    }
    static name(name) {
        let resource = Route.getPrefix();
        do {
            resource = resource.substring(1);
        } while (resource.charAt(0) === '/');
        if (resource !== ''){
            resource+= '.';
        }
        if (Route.#storedRoutes[`${resource}${name}`] === undefined){
            Route.#storedRoutes[`${resource}${name}`] = Route.#currentName;
            Route.#currentName = '';
        } else {
            console.error(`Route name ${resource}${name} already exists.`);
        }
    }
    static routes() {
        return Route.#storedRoutes;
    }

    static middleWare(){

    }
}

module.exports = Route;
