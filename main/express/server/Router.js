const MiddlewareHandler = require('../../../app/MiddlewareHandler');
const expressRouter = require('express').Router();

class Route {
    static #prefix = '/';
    static mainRouter = expressRouter;
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
    static setPrefix(prefix){
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
    static getPrefix(){
        return Route.#prefix;
    }
    static #handleRoutes(method, url, args) {
        Route.#reset();
    
        // Prepend the group resource prefix to the URL
        url = `${Route.#groupResource}${url}`.replace(/\/+/g, '/'); // Ensure no double slashes
    
        let newOpts;
        let finalConvertion;
    
        if (Array.isArray(args)) {
            const [controller, action] = args;
            if (!Route.#storedController[controller.name]) {
                Route.#storedController[controller.name] = new controller();
            }
            const controllerInstance = Route.#storedController[controller.name];
            const actionMethod = controllerInstance[action];
            if (typeof actionMethod === 'function') {
                finalConvertion = actionMethod;
            }
        } else if (args !== undefined && typeof args === 'function') {
            finalConvertion = args;
        }
    
        if (finalConvertion !== undefined && typeof finalConvertion === 'function') {
            newOpts = (req, res) => {
                const type = {};
                const methodType = req.method.toLowerCase();
    
                if (methodType === 'post') {
                    type.post = req.body;
                } else if (methodType === 'get') {
                    type.get = req.query;
                } else if (methodType === 'put') {
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
                        acceptLanguage: req.headers['accept-language'],
                        referer: req.headers['referer'] || null,
                        session: req.session || null,
                        files: req.files || null,
                        received: type[methodType],
                    },
                };
    
                const params = data.request.params;
                global.dd = (data) => dump(data, true);
                global.request = data.request;
                finalConvertion(...Object.values(params));
            };
        }
    
        if (newOpts !== undefined) {
            if (!Route.#storedMethodRoutes[method][url]) {
                Route.#storedMethodRoutes[method][url] = {};
            }
            Route.#storedMethodRoutes[method][url]['function_use'] = newOpts;
            Route.#currentUrl = url;
            Route.#currentMethod = method;
            if (Route.#middlewareArr.length){
                Route.#middlewareArrHandler(Route.#middlewareArr);
            }
            if (Route.#currentAs !== ''){
            }
            Route.name(Route.#currentAs);
        }
    }
    

    static name(name){
        if (Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'] !== undefined && Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'].endsWith('.')){
            Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'] += name;
        } else {
            Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'] = name;
        }
        return Route;
    }
    static #resourceNaming(name){
        if (Route.#currentUrl === '/test/hello/testing'){
            console.log(name);
        }
        Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['name'] = name;
        return Route;
    }
    static middleware(middlewareName){
        if (typeof middlewareName === 'string'){
            if (!Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['middlewares']){
                Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['middlewares'] = [];
            }
            Route.#storedMethodRoutes[Route.#currentMethod][Route.#currentUrl]['middlewares'].unshift(Route.#middlewareHandler.middlewareAliases()[middlewareName]['handle']);

        }
        return Route;
    }

    static #reset(){
        Route.#currentUrl = '';
        Route.#currentMethod = '';
    }

    static get(url, args){
        Route.#handleRoutes('get', url, args);
        return Route;
    }
    static post(url, args){
        Route.#handleRoutes('post', url, args);
        return Route;
    }
    static put(url, args){
        Route.#handleRoutes('put', url, args);
        return Route;
    }
    static delete(url, args){
        Route.#handleRoutes('delete', url, args);
        return Route;
    }
    static patch(url, args){
        Route.#handleRoutes('patch', url, args);
        return Route;
    }

    static getStoredRoutes(){
        return Route.#storedMethodRoutes;
    }

    static resource(resource, controller) {
        do {
            resource = resource.substring(1);
        } while (resource.charAt(0) === '/');
        let naming = resource == ''?'':`${resource}.`;
        let as = Route.#currentAs == '' ? '' : `${Route.#currentAs}`;
        let combine = `${as}${naming}`;
        Route.get(`${resource == '' ? resource : `/${resource}`}`, [controller, 'index']).#resourceNaming(`${combine}index`);
        Route.get(`${resource == '' ? resource : `/${resource}`}/create`, [controller, 'create']).#resourceNaming(`${combine}create`);
        Route.post(`${resource == '' ? resource : `/${resource}`}`, [controller, 'store']).#resourceNaming(`${combine}store`);
        Route.get(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'show']).#resourceNaming(`${combine}show`);
        Route.get(`${resource == '' ? resource : `/${resource}`}/:id/edit`, [controller, 'edit']).#resourceNaming(`${combine}edit`); 
        Route.put(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'update']).#resourceNaming(`${combine}update`);
        Route.delete(`${resource == '' ? resource : `/${resource}`}/:id`, [controller, 'destroy']).#resourceNaming(`${combine}destroy`);

        return Route;
    }

    static group(opts, callback) {
        let resource = opts.prefix.replace(/^\/+/, ''); // Simplified leading slash removal
        
        if (!opts.as) {
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

    static #middlewareArrHandler(array){
        for(let middleware of array){
            Route.middleware(middleware);
        }
    }
    
}

module.exports = Route;