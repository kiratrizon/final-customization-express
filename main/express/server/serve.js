const webRoute = require('../../../Routes/web');
const apiRoute = require('../../../Routes/api');
const path = require('path');
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

    static validateRoute(args1) {
        if (
            !args1 ||
            typeof args1.mainRouter !== 'function' ||
            typeof args1.mainRouter.stack !== 'object' ||
            !Array.isArray(args1.mainRouter.stack)
        ) {
            return;
        }

        Server.#duplicateRoutesDetector(Server.#routes, args1.routes());
        Server.app.use(args1.getPrefix(), args1.mainRouter);
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


        // Set up global functions
        global.routes = (name) => {
            if (Server.#routes.hasOwnProperty(name)) {
                return `${Server.#baseUrl}${Server.#routes[name]}`;
            }
            throw new Error(`Route ${name} not found.`);
        };

        // Global request/response handlers
        Server.app.use((req, res, next) => {

            global.renderData = (data, shouldExit = false) => {
                const acceptHeader = req.headers['accept'];
        
                if (acceptHeader && acceptHeader.includes('application/json')) {
                    res.set('Content-Type', 'application/json');
                    res.send(JSON.stringify(data, null, 2));
                } else {
                    const tailwindScript = `<script src="/global_assets/tailwind.js"></script>`;
                    const tailwindStyles = `
                        <style>
                            div.debug { font-family: sans-serif; padding: 2rem; background-color: #f7fafc; }
                            pre { background-color: #000030; padding: 1rem; border-radius: 0.5rem; }
                            .data-type-wrapper {
                                display: inline-block;
                                max-width: 100%;
                                overflow-wrap: break-word;
                                word-wrap: break-word;
                                word-break: break-word;
                                white-space: pre-wrap;
                            }
                            .scrollable {
                                max-width: 100%;
                                overflow-x: auto;
                            }
                            .string { color: #48bb78; } /* Green for strings */
                            .number { color: #ed8936; } /* Orange for numbers */
                            .boolean { color: #3182ce; } /* Blue for booleans */
                            .object-key { color: #a0aec0; font-weight: bold; } /* Gray for object keys */
                            .object-value { color: #2d3748; }
                            .array { color: #805ad5; } /* Purple for arrays */
                            .null { color: #9b2c2c; } /* Red for null */
                            .undefined { color: #ed8936; } /* Orange for undefined */
                            .indentation { padding-left: 20px; }
                        </style>
                    `;
        
                    const recursiveRender = (value, level = 0) => {
                        const indentClass = `indentation level-${level}`;
                        if (Array.isArray(value)) {
                            return `<div class="array scrollable ${indentClass}">${value.map(item => `<div>${recursiveRender(item, level + 1)}</div>`).join('')}</div>`;
                        } else if (value === null) {
                            return `<div class="null ${indentClass}">null</div>`;
                        } else if (typeof value === 'object') {
                            return `<div class="object scrollable ${indentClass}">${Object.entries(value).map(([key, val]) => 
                                `<div><span class="object-key">${key}:</span> <span class="object-value">${recursiveRender(val, level + 1)}</span></div>`
                            ).join('')}</div>`;
                        } else if (typeof value === 'string') {
                            return `<div class="string ${indentClass}">"${value}"</div>`;
                        } else if (typeof value === 'number') {
                            return `<div class="number ${indentClass}">${value}</div>`;
                        } else if (typeof value === 'boolean') {
                            return `<div class="boolean ${indentClass}">${value}</div>`;
                        } else if (typeof value === 'undefined') {
                            return `<div class="undefined ${indentClass}">undefined</div>`;
                        }
                        return `<div>${value}</div>`;
                    };
        
                    const htmlContent = `
                        ${tailwindScript}
                        ${tailwindStyles}
                        <div class="debug">
                            <pre class="data-type-wrapper">${recursiveRender(data)}</pre>
                        </div>
                    `;
                    res.set('Content-Type', 'text/html');
                    res.send(htmlContent);
                }
        
                if (shouldExit) res.end();
            }
            global.dump = (data, end = false) => global.renderData(data, end);
            if (!req.session) {
                req.session = {};
            }

            Server.#baseUrl = `${req.protocol}://${req.get('host')}`;
            global.req_derive = req;
            global.res_derive = res;

            global.json = (data, status = 200) => res.status(status).json(data);
            global.view = (view, data = {}) => res.status(data ? 200 : 403).render(view, data);
            global.redirect = (url) => res.redirect(url);
            global.back = () => res.redirect(req.get('Referrer') || '/');
            global.isApiUrl = () => req.path.startsWith('api');
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
        const origins = config('origins.origins').length ? config('origins.origins') :  '*'
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
        if (typeof Boot['404'] === 'function'){
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
}

Server.boot();

Server.validateRoute(apiRoute);
Server.validateRoute(webRoute);

Server.finishBoot();

module.exports = Server.app;