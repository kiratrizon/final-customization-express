const MiddlewareHandler = require('../../app/MiddlewareHandler');

class Route {
    static mainRouter = require('express').Router();
    static handleRequest(requestMethod, prefix, options) {

        const newRoute = require('express').Router();
        let newOpts;
        if (Array.isArray(options)) {
            const [controller, method] = options;
            const instanceofController = new controller();
            if (typeof instanceofController[method] === 'function') {
                newOpts = (req, res) => {
                    instanceofController.init(req, res);
                    const params = req.params;
                    if (Object.keys(params).length > 0) {
                        instanceofController[method](...Object.values(params));
                    } else {
                        instanceofController[method]
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

    static get(prefix, options) {
        this.handleRequest('get', prefix, options);
    }

    static post(prefix, options) {
        this.handleRequest('post', prefix, options);
    }
    static put(prefix, options) {
        this.handleRequest('put', prefix, options);
    }
    static delete(prefix, options) {
        this.handleRequest('delete', prefix, options);
    }
    static patch(prefix, options) {
        this.handleRequest('patch', prefix, options);
    }

    static group(opts = {}, callback) {
        const currentPrefix = opts.prefix || '';
        const currentMiddleware = opts.middleware || null;

        const originalMainRouter = this.mainRouter;
        this.mainRouter = require('express').Router();

        if (currentMiddleware && typeof currentMiddleware === 'string') {
            const MH = new MiddlewareHandler().middlewareAliases();
            if (Object.keys(MH).includes(currentMiddleware) && typeof MH[currentMiddleware].handle === 'function') {
                const middlewareClass = MH[currentMiddleware].handle;
                originalMainRouter.use(currentPrefix, middlewareClass, this.mainRouter);
            } else {
                originalMainRouter.use(currentPrefix, this.mainRouter);
            }
        } else if (currentMiddleware && typeof currentMiddleware === 'function') {
            originalMainRouter.use(currentPrefix, currentMiddleware, this.mainRouter);
        } else {
            originalMainRouter.use(currentPrefix, this.mainRouter);
        }

        callback();

        this.mainRouter = originalMainRouter;
    }
}

module.exports = Route;
