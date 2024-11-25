const MiddlewareHandler = require('../../app/MiddlewareHandler');

class Route {
    static mainRouter = require('express').Router();
    static #handleRequest(requestMethod, prefix, options) {

        const newRoute = require('express').Router();
        let newOpts;
        if (Array.isArray(options)) {
            const [controller, method] = options;
            const instanceofController = new controller();
            if (typeof instanceofController[method] === 'function') {
                newOpts = () => {
                    const data = {
                        request: {
                            method: req.method,
                            url: req.url,
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
            newRoute[requestMethod](prefix, newOpts)
            this.mainRouter.use(newRoute);
        }
    }

    static get(prefix, options) {Route.#handleRequest('get', prefix, options);}
    static post(prefix, options) {Route.#handleRequest('post', prefix, options);}
    static put(prefix, options) {Route.#handleRequest('put', prefix, options);}
    static delete(prefix, options) {Route.#handleRequest('delete', prefix, options);}
    static patch(prefix, options) {Route.#handleRequest('patch', prefix, options);}

    static group(opts = {}, callback) {
        const currentPrefix = opts.prefix || '';
        const currentMiddleware = opts.middleware || null;

        const originalMainRouter = this.mainRouter;
        this.mainRouter = require('express').Router();

        Route.#applyMiddleware(originalMainRouter, currentPrefix, currentMiddleware);

        callback();

        this.mainRouter = originalMainRouter;
    }

    static #applyMiddleware(router, prefix, middleware) {
        if (typeof middleware === 'string') {
            const middlewareHandler = new MiddlewareHandler().middlewareAliases();
            if (Object.keys(middlewareHandler).includes(middleware)) {
                const middlewareClass = middlewareHandler[middleware]?.handle;
                if (typeof middlewareClass === 'function') {
                    router.use(prefix, middlewareClass, this.mainRouter);
                } else {
                    router.use(prefix, this.mainRouter);
                }
            } else {
                router.use(prefix, this.mainRouter);
            }
        } else if (typeof middleware === 'function') {
            router.use(prefix, middleware, this.mainRouter);
        } else {
            router.use(prefix, this.mainRouter);
        }
    }
}

module.exports = Route;
