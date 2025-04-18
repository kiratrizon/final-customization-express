require('./variables');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const Boot = require('../../../libraries/Services/Boot');
const cors = require('cors');
const { default: helmet } = require('helmet');
const { createClient } = require('redis');
const { RedisStore } = require('connect-redis');
const multer = require('multer');
const FileHandler = require('../http/ExpressFileHandler');
const ExpressRequest = require('../http/ExpressRequest');
const ExpressRedirect = require('../http/ExpressRedirect');
const ExpressResponse = require('../http/ExpressResponse');
require('dotenv').config();

const renderData = (data, shouldExit = false, res) => {
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
	};

	const htmlContent = `
        ${tailwindStyles}
        <div class="debug">
            <pre class="data-type-wrapper">${recursiveRender(data)}</pre>
        </div>
    `;

	// Send HTML if shouldExit is false
	if (res) {
		res.set('Content-Type', 'text/html');
		res.send(htmlContent);
	}

	// End response if shouldExit is true
	if (shouldExit) res.end();
};

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
			Object.entries(routes).forEach(([url, values]) => {
				// console.log(`URL: ${url}`);
				// console.log(`Values: `, values);
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
					if (values['name'].endsWith('.')) {
						console.warn(`Route.${method}(${url}, callback)`, ` name is incomplete ${values['name']}`);
					} else {
						routeNames[values['name']] = newUrl;
					}
				}
				// console.log(`Method: ${method}`);
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
		const handleBoot = Server.#handle();

		const appEssentials = [
			'session',
			'cors',
			'cookieParser',
			'flash',
			'helmet'
		];
		appEssentials.forEach(key => {
			Server.app.use(handleBoot[key]);
		});
		Server.app.use(FileHandler.getFileHandler());
		Server.app.use(FileHandler.handleFiles);
		Server.app.set('view engine', config('view.defaultViewEngine'));
		Server.app.set('views', view_path());

		// Global request/response handlers
		Server.app.use((req, res, next) => {
			// determine if it's an API request or AJAX request
			isRequest = () => {
				if (req.xhr) {
					return true;
				}
				const apiUrl = req.path.startsWith('/api');
				return apiUrl;
			}
			const methodType = req.method.toUpperCase();

			req.headers['full-url'] = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
			$_POST = req.body || {};
			$_GET = req.query || {};
			$_FILES = req.files || {};
			$_COOKIE = req.cookies || {};
			const REQUEST = {
				method: methodType,
				params: req.params,
				headers: req.headers,
				body: req.body,
				query: req.query,
				cookies: req.cookies,
				path: req.path,
				originalUrl: req.originalUrl,
				ip: req.ip,
				protocol: req.protocol,
				user: req.user || null,
				files: req.files || null,
			};
			// log(REQUEST, 'test', 'request');
			request = new ExpressRequest(REQUEST);
			dump = (data) => renderData(data, false, res);
			dd = (data) => {
				console.log(data);
				renderData(data, true, res);
			};
			res.locals['dump'] = (data) => renderData(data);
			res.locals['dd'] = (data) => {
				renderData(data);
				process.exit(0);
			};
			res.locals['old'] = (key) => {
				return 'test';
			}
			if (!req.session.session_auth) {
				req.session.session_auth = {};
			}
			if (!req.session.session_hidden) {
				req.session.session_hidden = {};
			}
			if (!req.session.global_variables) {
				req.session.global_variables = {};
			}
			if (!req.session.oldPost) {
				req.session.oldPost = {};
			}
			$_SESSION = req.session.global_variables;
			const session = req.session;
			globalThis.$_SESSION_AUTH = session.session_auth;
			globalThis.$_SESSION_HIDDEN = session.session_hidden;

			Server.#baseUrl = `${req.protocol}://${req.get('host')}`;
			route = (name, args = {}) => {
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
			// req.flash('hello', 'world');
			functionDesigner('redirect', (url = null) => {
				const instance = new ExpressRedirect(url);
			
				instance.back = () => {
					instance.url = req.get('Referrer') || '/';
					return instance;
				};
			
				instance.route = (name, args = {}) => {
					instance.url = route(name, args);
					return instance;
				};
			
				return instance;
			});
			back = () => {
				return req.get('Referrer') || '/';
			};


			BASE_URL = Server.#baseUrl;
			PATH_URL = REQUEST.path;
			QUERY_URL = REQUEST.originalUrl;
			ORIGINAL_URL = `${BASE_URL}${QUERY_URL}`;
			next();
		});

		Server.#loadAndValidateRoutes();
	}

	static #handle() {
		let redisClient = createClient(config('app.redis'));
		redisClient.connect().catch(console.error)

		// Initialize store.
		let redisStore = new RedisStore({
			client: redisClient,
			prefix: "myreact:",
			ttl: 315576000 * 60
		})
		const sessionObj = {
			store: redisStore,
			secret: process.env.MAIN_KEY || 'secret',
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: false,
				httpOnly: false,
				maxAge: 1000 * 60 * 60 * 24 * 365 * 60
			},
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
			cors: cors(corsOptions),
			helmet: helmet(),
		};
	}

	static #duplicateRoutesDetector(obj1, obj2) {
		const duplicates = Object.keys(obj2).filter(key => obj1.hasOwnProperty(key));
		if (duplicates.length > 0) {
			throw new Error(`Duplicate routes detected: ${duplicates.join(', ')}`);
		}
		Server.#routes = { ...obj1, ...obj2 };
	}

	static #finishBoot() {
		if (typeof Boot['notFound'] === 'function') {
			Server.app.use((req, res) => {
				const expressResponse = Boot['notFound']();
				if (expressResponse instanceof ExpressResponse) {
					const { html, statusCode, headers, json, returnType } = expressResponse.accessData();
					res.status(statusCode);
					res.set(headers);
					if (returnType == 'html') {
						res.send(html);
					} else if (returnType == 'json') {
						res.json(json);
					}
				} else if (expressResponse !== undefined) {
					res.status(404).set({
						'Content-Type': 'text/html',
					}).send(expressResponse);
				}
				return;
			});
		}
	}

	static #loadAndValidateRoutes() {
		const routesDir = path.join(__dirname, '../../../Routes');
		const routeFiles = fs.readdirSync(routesDir);
		const jsFiles = routeFiles.filter(file => file.endsWith('.js'));
		let currentRoute = null;
		if (jsFiles.includes('web.js')) {
			const webRoutePath = path.join(routesDir, 'web.js');
			currentRoute = require(webRoutePath);
			Server.#validateRoute(currentRoute);
			jsFiles.splice(jsFiles.indexOf('web.js'), 1);
		}

		jsFiles.forEach(file => {
			const appFile = file.split('.js')[0];
			if (currentRoute) {
				currentRoute.setPrefix(`/${appFile}`);
			}
			const routePath = path.join(routesDir, file);
			currentRoute = require(routePath);
			Server.#validateRoute(currentRoute);
		});
		Server.#finishBoot();
	}
}

Server.boot();

// Server.app.get('/testtroy/:id?', (req, res) => {
// 	res.send('Hello World');
// });

module.exports = Server.app;
