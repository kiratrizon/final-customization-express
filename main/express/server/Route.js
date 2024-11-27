const MiddlewareHandler = require('../../../app/MiddlewareHandler');

class Route {
    static #prefix = '/';
    static getPrefix(){
        return Route.#prefix;
    }
    static #currentName = '';
    static #storedRoutes = {};
    static mainRouter = require('express').Router();
    static #handleRequest(requestMethod, prefix, options) {

        const newRoute = require('express').Router();
        let newOpts;
        if (Array.isArray(options)) {
            const [controller, method] = options;
            const instanceofController = new controller();
            if (typeof instanceofController[method] === 'function') {
                newOpts = () => {
                    const req = req_derive;
                    const res = res_derive;
                    const data = {
                        request: {
                            method: req.method,
                            url: req.originalUrl,
                            body: req.body,
                            params: req.params,
                            headers: req.headers,
                            query: req.query,
                            cookies: req.cookies,
                            path: req.path,
                            originalUrl: req.originalUrl,
                            ip: req.ip,
                            protocol: req.protocol,
                            user: req.user || null,
                            route: req.route || null,
                            acceptLanguage: req.headers['accept-language'],
                            referer: req.headers['referer'] || null,
                            session: req.session || null,
                            files: req.files || null,
                        }
                    };
                    const params = data.request.params;
                    instanceofController.init(data.request);
                    if (Object.keys(params).length > 0) {
                        instanceofController[method](...Object.values(params));
                    } else {
                        instanceofController[method]();
                    }
                };
            }
        } else if (typeof options === 'function') {
            newOpts = options;
        }
        if (newOpts !== undefined) {
            newRoute[requestMethod](`${prefix}`, newOpts)
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
        Route.get(`/${resource}`, [controller, 'index']).name(`${resource}.index`);
        Route.get(`/${resource}/create`, [controller, 'create']).name(`${resource}.create`);
        Route.post(`/${resource}`, [controller, 'store']).name(`${resource}.store`);
        Route.get(`/${resource}/:id`, [controller, 'show']).name(`${resource}.show`);
        Route.get(`/${resource}/:id/edit`, [controller, 'edit']).name(`${resource}.edit`); 
        Route.put(`/${resource}/:id`, [controller, 'update']).name(`${resource}.update`);
        Route.delete(`/${resource}/:id`, [controller, 'destroy']).name(`${resource}.destroy`);
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
}

module.exports = Route;
