const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const Boot = require('../../../libraries/Services/Boot');
const cors = require('cors');
require('dotenv').config();
require('./GlobalFunctions');

class Server {
    static express = require('express');
    static app = Server.express();
    static #baseUrl = '';
    static #routes = {};
    static router = Server.express.Router();
    static #validateRoute(args1) {
        const instantiatedRoutes = new args1();
        if (
            !instantiatedRoutes ||
            typeof instantiatedRoutes.mainRouter !== 'function' ||
            typeof instantiatedRoutes.mainRouter.stack !== 'object' ||
            !Array.isArray(instantiatedRoutes.mainRouter.stack)
        ) {
            return;
        }
        const routePrefix = instantiatedRoutes.getPrefix();
        const storedRoutes = Object.entries(instantiatedRoutes.getStoredRoutes());
        // console.log(args1.getStoredRoutes());
        const routeNames = {};
        storedRoutes.forEach(([method, routes]) => {
            // console.log(`Method: ${method}`);

            Object.entries(routes).forEach(([url, values]) => {
                // console.log(`URL: ${url}`);
                // console.log(`Values: `,values);
                if (values['function_use'] === undefined && typeof values['function_use'] !== 'function') {
                    return;
                }
                const middlewares = values['middlewares'] || [];
                let newUrl = '';
                if (routePrefix !== '/') {
                    newUrl = `${routePrefix}${url == '' ? '/' : url}`;
                } else {
                    newUrl = url == '' ? '/' : url;
                }
                if (values['name'] !== undefined && values['name'] !== '' && typeof values['name'] === 'string') {
                    if (!values['name'].endsWith('.')) {
                        routeNames[values['name']] = newUrl;
                    } else {
                        console.warn(`Route.${method}(${url}, callback)`, `name is incomplete ${values['name']}`);
                    }
                }
                Server.router[method](url == '' ? '/' : url, ...middlewares, values['function_use']);
            });
        });
        Server.#duplicateRoutesDetector(Server.#routes, routeNames);
        Server.app.use(routePrefix, Server.router);
        Server.router = Server.express.Router();
    }

    static boot() {
        Server.app.use(morgan('dev'));
        Server.app.use(Server.express.json());
        Server.app.use(Server.express.urlencoded({ extended: true }));
        Server.app.use(Server.express.static(path.join(__dirname, '..', 'public')));
        const handleBoot = Server.handle();
        Boot.use().forEach(key => {
            Server.app.use(handleBoot[key]);
        });
        Server.app.set('view engine', 'ejs');
        Server.app.set('views', view_path());

        // Global request/response handlers
        Server.app.use((req, res, next) => {
            const type = {};
            const methodType = req.method.toUpperCase();

            if (methodType === 'POST') {
                type.POST = req.body;
            } else if (methodType === 'GET') {
                type.GET = req.query;
            } else if (methodType === 'PUT') {
                type.PUT = req.body;
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
                    // session: req.session || null,
                    files: req.files || null,
                    received: type[methodType],
                },
            };
            global.REQUEST = data.request;
            global[methodType] = type[methodType];
            global.dump = (data) => renderData(data, false, res);
            global.dd = (data) => {
                renderData(data, true, res);
            };
            res.locals.dump = (data) => renderData(data);
            res.locals.dd = (data) => {
                renderData(data);
                process.exit(0);
            };
            if (!req.session) {
                req.session = {};
            }
            if (!req.session.session_auth) {
                req.session.session_auth = {};
            }
            global.SESSION = req.session;
            global.SESSION_AUTH = SESSION.session_auth;
            Server.#baseUrl = `${req.protocol}://${req.get('host')}`;

            global.jsonResponse = (data, status = 200) => res.status(status).json(data);
            global.view = (view, data = {}) => {
                const viewPath = path.join(view_path(), `${view.split('.').join('/')}.ejs`);

                if (fs.existsSync(viewPath)) {
                    res.status(200).render(view, data);
                } else {
                    dump({ "error": `${path.relative(base_path(), view_path())}/${view}.ejs not found` }, true);
                }
            };
            global.redirect = (url) => res.redirect(url);
            global.back = () => res.redirect(req.get('Referrer') || '/');
            global.isApiUrl = () => req.path.startsWith('api');
            // Set up global functions
            global.route = (name, args = {}) => {
                if (Server.#routes.hasOwnProperty(name)) {
                    let route = Server.#routes[name];

                    // Validate required parameters
                    const requiredParams = (route.match(/:([^\/\?]+)(?=[\/\?]|$)/g) || []).map(param => param.substring(1));
                    requiredParams.forEach(param => {
                        if (!(param in args) || args[param] === undefined || args[param] === null) {
                            const stack = new Error().stack;
                            const callerLine = stack.split("\n")[4].trim();
                            throw `Missing required parameter "${param}" for route "${name}".\n    ${callerLine}`;
                        }
                    });

                    // Replace placeholders with values from args
                    Object.entries(args).forEach(([key, value]) => {
                        const regexOptional = new RegExp(`:${key}\\?`, "g"); // Match optional parameter
                        const regexRequired = new RegExp(`:${key}`, "g"); // Match required parameter

                        if (value !== undefined) {
                            // Replace both required and optional parameters with the value
                            route = route.replace(regexOptional, value).replace(regexRequired, value);
                        } else {
                            // Remove optional parameters if no value is provided
                            route = route.replace(regexOptional, "");
                        }
                    });

                    // Remove leftover optional placeholders (e.g., /user/:id?)
                    route = route.replace(/\/:[^\/]+\?/g, "");

                    return `${Server.#baseUrl}${route}`;
                }

                const stack = new Error().stack;
                const caller = stack.split("\n")[2].trim();
                throw `route("${name}") not found.\n${caller}`;
            };

            global.BASE_URL = Server.#baseUrl;
            res.locals.BASE_URL = Server.#baseUrl;
            global.PATH_URL = REQUEST.path;
            res.locals.PATH_URL = REQUEST.path;
            global.PATH_QUERY = REQUEST.originalUrl;
            res.locals.PATH_QUERY = REQUEST.originalUrl;
            global.ORIGINAL_URL = `${BASE_URL}${PATH_QUERY}`;
            res.locals.ORIGINAL_URL = `${BASE_URL}${PATH_QUERY}`;
            next();
        });
    }

    static handle() {
        const sessionObj = {
            secret: process.env.MAIN_KEY || 'secret',
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false },
        };
        const origins = config('origins.origins').length ? config('origins.origins') : '*'
        const corsOptions = {
            origin: origins,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization'],
            optionsSuccessStatus: 200,
        };
        return {
            cookieParser: cookieParser(),
            session: session(sessionObj),
            flash: flash(),
            // cors: Server.#corsAsync,
            cors: cors(corsOptions),
        };
    }

    static #duplicateRoutesDetector(obj1, obj2) {
        const duplicates = Object.keys(obj2).filter(key => obj1.hasOwnProperty(key));
        if (duplicates.length > 0) {
            throw new Error(`Duplicate routes detected: ${duplicates.join(', ')}`);
        }
        Server.#routes = { ...obj1, ...obj2 };
    }

    static finishBoot() {
        if (typeof Boot['404'] === 'function') {
            Server.app.use(Boot['404']);
        }
    }

    static async #getCorsOptions() {
        return new Promise((resolve) => {
            const corsOptions = {
                origin: (origin, callback) => {
                    const allowedOrigins = config('origins.origins') || '*';
                    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                        callback(null, true);
                    } else {
                        callback(new Error('Not allowed by CORS'));
                    }
                },
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                credentials: true,
                allowedHeaders: ['Content-Type', 'Authorization'],
                optionsSuccessStatus: 200,
            };
            console.log('testCorsOptions', corsOptions);
            resolve(corsOptions);
        });
    }

    static async #corsAsync(req, res, next) {
        try {
            const corsOptions = await Server.#getCorsOptions();
            cors(corsOptions)(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    static loadAndValidateRoutes() {
        const routesDir = path.join(__dirname, '../../../Routes');
        const routeFiles = fs.readdirSync(routesDir);
        const jsFiles = routeFiles.filter(file => file.endsWith('.js'));

        if (jsFiles.includes('web.js')) {
            const webRoutePath = path.join(routesDir, 'web.js');
            const webRoute = require(webRoutePath);
            Server.#validateRoute(webRoute);
            jsFiles.splice(jsFiles.indexOf('web.js'), 1);
        }

        jsFiles.forEach(file => {
            const routePath = path.join(routesDir, file);
            const route = require(routePath);
            Server.#validateRoute(route);
        });
    }
}

Server.boot();
Server.loadAndValidateRoutes();
Server.finishBoot();

module.exports = Server.app;