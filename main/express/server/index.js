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

class Server {
	static express = express;
	static app = Server.express();
	static #baseUrl = '';
	static #routes = {};
	static router = Server.express.Router();

	static boot() {
		Server.app.use(morgan('dev'));
		Server.app.use(Server.express.json());
		Server.app.use(Server.express.urlencoded({ extended: true }));
		Server.app.use(Server.express.static(public_path()));
		Server.app.use('/favicon.ico', Server.express.static(public_path('favicon.ico')));
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
		Server.app.use(async (req, res, next) => {

			Boot.register();

			// determine if it's an API request or AJAX request
			isRequest = () => {
				if (req.xhr) {
					return true;
				}
				const userAgent = req.headers['user-agent'] || '';
				if (userAgent.includes('Postman')) {
					return true;
				}
				const apiUrl = req.path.startsWith('/api');
				return apiUrl;
			}

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


			BASE_URL = Server.#baseUrl;
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
		jsFiles.forEach(file => {
			// set prefix
			const fileName = file.replace('.js', '');
			const routePrefix = fileName === 'web' ? '' : `/${fileName}`;
			const filePath = path.join(routesDir, file);
			const RouteClass = require(filePath);
			const instance = new RouteClass();
			let data = instance.reveal();
			const allowedMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
			if (data) {
				if (!empty(data.routers) && !empty(data.routeValue)) {
					let routers = data.routers;
					let routeValue = data.routeValue;
					// console.log('routers', routers);
					// console.log('routeValue', routeValue);
					const routeKeys = Object.keys(routers);
					routeKeys.forEach(rk => {
						const routerPrefix = rk.replace(/\/\*\d+\*/g, '') || '/';
						if (!empty(routers[rk])) {
							const loadRouter = Server.express.Router({ mergeParams: true });
							const appRouter = Server.express.Router();
							const loadedRoute = routers[rk];
							const { middlewares } = loadedRoute;
							const storedRouteNames = {};
							allowedMethods.forEach(method => {
								if (loadedRoute[method]) {
									loadedRoute[method].forEach(routeId => {
										const { path, internal_middlewares, newCallback, as } = routeValue[routeId];
										if (isset(as)) {
											if (storedRouteNames[as]) {
												console.warn(`Duplicate route name detected: "${as}". The route will be ignored.`);
											} else {
												const localPath = `${routePrefix}${['/', '{'].includes(routerPrefix[0]) ? '' : '/'}${routerPrefix}${path}`.replace(/\/{2,}/g, '/');
												storedRouteNames[as] = {};
												storedRouteNames[as]['allparams'] = [];
												storedRouteNames[as]['optional'] = [];
												const requiredParamRegex = /:([\w-]+)/g;
												const optionalParamRegex = /{\s*\/?:([\w-]+)\??\s*}/g;

												let match;
												while ((match = requiredParamRegex.exec(localPath)) !== null) {
													storedRouteNames[as]['allparams'].push(match[1]);
												}

												while ((match = optionalParamRegex.exec(localPath)) !== null) {
													storedRouteNames[as]['optional'].push(match[1]);
												}

												storedRouteNames[as]['path'] = `${localPath}`.replace(/{/g, '').replace(/}/g, '').replace(/\/{2,}/g, '/');
											}
										}
										// console.log(path)
										loadRouter[method](path, ...internal_middlewares, newCallback);
									});
								}
							});
							appRouter.use(routerPrefix, ...middlewares, loadRouter);
							Server.app.use(routePrefix, appRouter);
							Server.#duplicateRoutesDetector(Server.#routes, storedRouteNames);
						}
					});
				}
			}
		})


		Server.#finishBoot();
	}
}

Server.boot();

// const r = Server.express.Router();
// r.get('/test', (req, res) => {
// 	console.log(req.params);
// 	res.send('Hello World');
// });
// Server.app.use('{/:id}', r);

module.exports = Server.app;
