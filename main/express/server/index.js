require('./functions-and-variables');
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
const FileHandler = require('../http/ExpressFileHandler');
const ExpressRedirect = require('../http/ExpressRedirect');
const ExpressResponse = require('../http/ExpressResponse');
require('dotenv').config();
const express = require('express');
const ExpressView = require('../http/ExpressView');
const util = require('util');
const ExpressRegexHandler = require('../http/ExpressRegexHandler');
const Auth = require('./Auth');
const ExpressRequest = require('../http/ExpressRequest');


const myLink = `https://github.com/kiratrizon/final-customization-express`;
class Server {
	static express = express;
	static app = Server.express();
	static #baseUrl = '';
	static #routes = {};
	static router = Server.express.Router();

	static async boot() {
		Server.app.use(morgan('dev'));
		Server.app.use(Server.express.json());
		Server.app.use(Server.express.urlencoded({ extended: true }));
		Server.app.use(Server.express.static(public_path()));
		Server.app.use('/favicon.ico', Server.express.static(public_path('favicon.ico')));
		const handleBoot = await Server.#handle();

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
		Server.app.use(async (req, res, next) => {

			console.log(req.sessionID);
			$_POST = req.body || {};
			$_GET = req.query || {};
			$_FILES = req.files || {};
			$_COOKIE = req.cookies || {};
			const methodType = req.method.toUpperCase();
			const REQUEST = {
				method: methodType,
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
			request = (getInput) => {
				if (!is_string(getInput)) {
					return rq;
				} else {
					return rq.input(getInput);
				}
			}
			if (env('NODE_ENV') !== 'production') {
				res.setHeader('X-Developer', 'Throy Tower');
			}
			Boot.register();

			// determine if it's an API request or AJAX request
			isRequest = () => {
				// Check if it's an AJAX request (XHR)
				if (req.xhr) {
					return true;
				}

				// Check if the path starts with '/api' to identify API routes
				if (req.path.startsWith('/api/')) {
					return true;
				}

				// Check if the request's 'Accept' header includes 'application/json'
				if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
					return true;
				}

				// Check if the request is expecting JSON content, commonly used in APIs
				if (req.is('json')) {
					return true;
				}

				return false; // Default to false if none of the conditions match
			};

			const renderData = (data, res, dumped = false) => {
				const html = `
					<style>
						body { background: #f8fafc; color: #1a202c; font-family: sans-serif; padding: 2rem; }
						pre { background: #1a202c; color: #f7fafc; padding: 1.5rem; border-radius: 0.5rem; font-size: 14px; overflow-x: auto; }
						code { white-space: pre-wrap; word-break: break-word; }
					</style>
					<pre><code>${util.inspect(data, { colors: false, depth: null })}</code></pre>
				`;

				const json = data;

				if (dumped) {
					res.responses.html_dump.push(html);
					res.responses.json_dump.push(json);
					return;
				}

				if (res) {
					if (res.headersSent) {
						return;
					}
					if (!isRequest()) {
						res.setHeader('Content-Type', 'text/html');
						res.send(html);
					} else {
						res.setHeader('Content-Type', 'application/json');
						res.json(json);
					}
					res.end();
				}
			};

			req.headers['full-url'] = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
			if (!res.responses) {
				res.responses = {};
				res.responses.html_dump = [];
				res.responses.json_dump = [];
			}

			dump = (data) => renderData(data, res, true);
			dd = (data) => {
				renderData(data, res);
			};

			define('auth', () => Auth);

			Server.#baseUrl = `${req.protocol}://${req.get('host')}`;
			route = (name, args = {}) => {
				if (Server.#routes.hasOwnProperty(name) && isset(Server.#routes[name])) {
					let { path, allparams, optional } = Server.#routes[name];
					const requiredParams = allparams.filter(p => !optional.includes(p));
					const argsKeys = Object.keys(args);
					let passed = [];
					requiredParams.forEach(param => {
						if (argsKeys.includes(param)) {
							passed.push(param);
							path = path.replace(`:${param}`, args[param]);
						}
					})
					if (requiredParams.length !== passed.length) {
						throw `route("${name}") not found. Required parameters are missing. ${requiredParams.join(', ')}`;
					}

					optional.forEach(param => {
						let val = args[param];
						if (!isset(val) || empty(val)) {
							val = '';
							path = path.replace(`/:${param}`, val);
						} else {
							path = path.replace(`:${param}`, val);
						}
					})

					return `${Server.#baseUrl}${path}`;
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

			response_error = (error, data) => {
				if (isRequest) {
					res.status(422).json({ error });
				} else {
					res.redirect(422, back());
				}
			}


			BASE_URL = Server.#baseUrl;
			next();
		});

		Server.#loadAndValidateRoutes();
	}

	static async #handle() {
		let store;

		if (env('USE_MEMORY_CACHE') !== 'true' && env('NODE_ENV') === 'production') {
			let redisClient = createClient(config('app.redis'));

			try {
				await redisClient.connect();  // Await Redis connection
				// Initialize RedisStore after successful connection
				store = new RedisStore({
					client: redisClient,
					prefix: "myreact:",
					ttl: 60 * 60 * 24 * 7, // 7 days
				});
			} catch (err) {
				console.error('Redis connection error:', err);
				// Fallback to in-memory store if Redis fails
				store = new session.MemoryStore();
			}
		} else {
			store = new session.MemoryStore();
		}

		const sessionObj = {
			store: store,
			secret: env('MAIN_KEY') || 'secret',
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: env('NODE_ENV') === 'production',
				httpOnly: true,
				maxAge: 300000, // 30 seconds
			},
		};

		const origins = config('origins.origins').length ? config('origins.origins') : '*';

		const corsOptions = {
			origin: origins,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
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
		// prioritize the first object
		const duplicateKeys = Object.keys(obj1).filter(key => obj2.hasOwnProperty(key));
		if (duplicateKeys.length > 0) {
			duplicateKeys.forEach(key => {
				console.warn(`Duplicate route detected: "${key}". The route from the second object will be ignored.`);
			});
			obj2 = except(obj2, duplicateKeys);
		}
		Server.#routes = { ...obj1, ...obj2 };
	}

	static #finishBoot() {
		if (typeof Boot['notFound'] === 'function') {
			Server.app.use(async (req, res) => {
				const expressResponse = await Boot['notFound']();
				if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressView)) {
					if (expressResponse instanceof ExpressResponse) {
						const { html, statusCode, json, headers, returnType } = expressResponse.accessData();
						if (returnType === 'json') {
							res.status(statusCode).set(headers).json(json);
						} else if (returnType === 'html') {
							res.status(statusCode).set(headers).send(html);
						}
					} else if (expressResponse instanceof ExpressView) {
						const htmlResponse = expressResponse.getRendered();
						res.status(404).set({
							'Content-Type': 'text/html',
						}).send(htmlResponse);
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
		const routesDir = path.join(base_path(), 'routes');
		const routeFiles = fs.readdirSync(routesDir);
		const jsFiles = routeFiles.filter(file => file.endsWith('.js'));
		// remove web.js
		let webjs = null;
		if (jsFiles.includes('web.js')) {
			// splice
			jsFiles.splice(jsFiles.indexOf('web.js'), 1);
			webjs = 'web.js';
			jsFiles.push(webjs);
		}
		jsFiles.forEach(file => {
			// set prefix
			const fileName = file.replace('.js', '');
			const routePrefix = fileName === 'web' ? '' : `/${fileName}`;
			const filePath = path.join(routesDir, file);
			const RouteClass = require(filePath);
			const instance = new RouteClass();
			let data = instance.reveal();
			if (data) {
				const { default_route, group, routes } = data;

				// for group
				const groupKeys = Object.keys(group);
				groupKeys.forEach((key) => {
					const grDf = Server.express.Router({
						mergeParams: true
					});
					const gaDf = Server.express.Router();
					const groupRoute = key;
					const arrangeGroupRoute = groupRoute.replace(/\/\*\d+\*/g, '') || '/';
					const instancedGroup = group[key];
					const { as, middlewares, childRoutes } = instancedGroup.getGroup();

					// filterChildRoutes
					const filteredChildRoutes = Object.entries(childRoutes)
						.filter(([key, value]) => value.length > 0)
						.map(([key]) => key);
					filteredChildRoutes.forEach((k) => {
						const arrData = childRoutes[k];
						arrData.forEach((routeId) => {
							const routeInstanced = routes[routeId];
							if (is_function(routeInstanced.getRouteData)) {
								const { method, path, callback, internal_middlewares, as, regex, match } = routeInstanced.getRouteData();
								// regex
								if (!empty(regex)) {
									const regexHandler = new ExpressRegexHandler(regex);
									const regexMiddleware = regexHandler.applyRegex();
									internal_middlewares.unshift(regexMiddleware);
								}
								grDf[method](path, ...internal_middlewares, callback);
								if (is_array(match) && !empty(match)) {
									match.forEach((m) => {
										grDf[m](path, ...internal_middlewares, callback);
									})
								}
							}
						})
					});

					gaDf.use(arrangeGroupRoute, ...middlewares, grDf);
					Server.app.use(routePrefix, gaDf);
				});

				// for default route
				const filteredKeys = Object.entries(default_route)
					.filter(([key, value]) => value.length > 0)
					.map(([key]) => key);
				const rDf = Server.express.Router({
					mergeParams: true
				});
				filteredKeys.forEach((key) => {
					const arrData = default_route[key];
					arrData.forEach((routeId) => {
						const routeInstanced = routes[routeId];
						if (is_function(routeInstanced.getRouteData)) {
							const { method, path, callback, internal_middlewares, as, regex } = routeInstanced.getRouteData();
							// regex
							if (!empty(regex)) {
								const regexHandler = new ExpressRegexHandler(regex);
								const regexMiddleware = regexHandler.applyRegex();
								internal_middlewares.unshift(regexMiddleware);
							}
							rDf[method](path, ...internal_middlewares, callback);
						}
					})
				});
				Server.app.use(routePrefix, rDf);
			}
		})

		Server.#finishBoot();
	}
}

module.exports = Server;
