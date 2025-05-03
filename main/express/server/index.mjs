import './functions-and-variables.mjs';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import morgan from 'morgan';
import Boot from '../../../libraries/Services/Boot.mjs';
import cors from 'cors';
import helmet from 'helmet';  // Default import for helmet
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import FileHandler from '../http/ExpressFileHandler.mjs';
import ExpressRedirect from '../http/ExpressRedirect.mjs';
import express from 'express';
import util from 'util';
import ExpressRegexHandler from '../http/ExpressRegexHandler.mjs';
import Auth from './Auth.mjs';
import ExpressRequest from '../http/ExpressRequest.mjs';
import { fileURLToPath } from 'url';

// Create __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const myLink = `https://github.com/kiratrizon/final-customization-express`;
class Server {
	static express = express;
	static app = Server.express();
	static #baseUrl = '';
	static #routes = {};
	static router = Server.express.Router();

	static async boot() {
		await Boot.init();

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
		const viewEngine = await config('view.defaultViewEngine');
		Server.app.use(FileHandler.getFileHandler());
		Server.app.use(FileHandler.handleFiles);
		Server.app.set('view engine', viewEngine);
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
				if (name in Server.#routes) {
					const { full_path, required = [], optional = [] } = Server.#routes[name];
					required.forEach((key) => {
						if (!(key in args)) {
							throw new Error(`Missing required parameter: ${key}`);
						}
					});

					let url;
					const allparams = [...required, ...optional];
					allparams.forEach((key) => {
						if (key in args) {
							url = full_path.replace(`:${key}/`, `${args[key]}/`);
						} else {
							url = full_path.replace(`:${key}/`, '/');
						}
					})



					// Remove trailing slash if present
					if (url.endsWith('/')) {
						url = url.slice(0, -1);
					}
					// Remove double slashes
					url = url.replace(/\/+/g, '/');
					// Add base URL
					url = path.join(Server.#baseUrl, url);
					return url;
				}
				return null;
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

		await Server.#loadAndValidateRoutes();
	}

	static async #handle() {
		let store;
		const redisConf = await config('app.redis');
		if (env('USE_MEMORY_CACHE') !== 'true' && env('NODE_ENV') === 'production') {
			let redisClient = createClient(redisConf);

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
		const originsConf = (await config('origins.origins')) || [];
		const origins = originsConf.length ? originsConf : '*';

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

	static #finishBoot() {
		if (typeof Boot['notFound'] === 'function') {
			// Server.app.use(async (req, res) => {
			// 	const expressResponse = await Boot['notFound']();
			// 	if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressView)) {
			// 		if (expressResponse instanceof ExpressResponse) {
			// 			const { html, statusCode, json, headers, returnType } = expressResponse.accessData();
			// 			if (returnType === 'json') {
			// 				res.status(statusCode).set(headers).json(json);
			// 			} else if (returnType === 'html') {
			// 				res.status(statusCode).set(headers).send(html);
			// 			}
			// 		} else if (expressResponse instanceof ExpressView) {
			// 			const htmlResponse = expressResponse.getRendered();
			// 			res.status(404).set({
			// 				'Content-Type': 'text/html',
			// 			}).send(htmlResponse);
			// 		}
			// 	} else if (expressResponse !== undefined) {
			// 		res.status(404).set({
			// 			'Content-Type': 'text/html',
			// 		}).send(expressResponse);
			// 	}
			// 	return;
			// });
		}
	}

	static async #loadAndValidateRoutes() {
		const apiRoute = await import('../../../routes/api.mjs');
		const apiInstance = new apiRoute.default();
		const apiData = apiInstance.reveal();

		const webRoute = await import('../../../routes/web.mjs');
		const webInstance = new webRoute.default();
		const webData = webInstance.reveal();
		const dataOfRoutes = {
			api: apiData,
			web: webData,
		}
		const keys = Object.keys(dataOfRoutes);
		for (const key of keys) {
			const routePrefix = key === 'web' ? '' : `/${key}`;
			const data = dataOfRoutes[key];
			if (data) {
				const { default_route, group, routes } = data;

				// console.log(data)
				// for group
				const groupKeys = Object.keys(group);
				for (const key of groupKeys) {
					const grDf = Server.express.Router({
						mergeParams: true
					});
					const gaDf = Server.express.Router();
					const groupRoute = key;
					let arrangeGroupRoute = groupRoute.replace(/\*\d+\*/g, '') || '/';
					arrangeGroupRoute = arrangeGroupRoute.replace(/\/+/g, '/');
					const instancedGroup = group[key];
					const { as = [], middlewares, childRoutes } = instancedGroup.getGroup();
					let groupAs = as.join('.');
					// filterChildRoutes
					const filteredChildRoutes = Object.entries(childRoutes)
						.filter(([key, value]) => value.length > 0)
						.map(([key]) => key);
					for (const k of filteredChildRoutes) {
						const arrData = childRoutes[k];
						for (const routeId of arrData) {
							const routeInstanced = routes[routeId];
							if (is_function(routeInstanced.getRouteData)) {
								const { method, url, callback, internal_middlewares, as = '', regex, match, params, full_path } = routeInstanced.getRouteData();
								let routeAs = as;
								if (!empty(routeAs)) {
									if (!empty(groupAs)) {
										routeAs = `${groupAs}.${as}`;
									} else {
										routeAs = `${as}`;
									}
									// replace duplicate dots
									routeAs = routeAs.replace(/\.+/g, '.');
									// remove last dot
									if (routeAs.endsWith('.')) {
										routeAs = routeAs.slice(0, -1);
									}
									// remove first dot
									if (routeAs.startsWith('.')) {
										routeAs = routeAs.slice(1);
									}

									// set route
									if (routeAs in Server.#routes) {
										console.warn(`${routeAs} already exists in routes`);
									} else {
										Server.#routes[routeAs] = {
											full_path: path.join(routePrefix, full_path),
											...params,
										}
									}
								}
								// regex
								if (!empty(regex)) {
									const regexHandler = new ExpressRegexHandler(regex);
									const regexMiddleware = regexHandler.applyRegex();
									internal_middlewares.unshift(regexMiddleware);
								}
								grDf[method](url, ...internal_middlewares, callback);
								if (is_array(match) && !empty(match)) {
									for (const m of match) {
										grDf[m](url, ...internal_middlewares, callback);
									}
								}
							}
						}
					}

					gaDf.use(arrangeGroupRoute, ...middlewares, grDf);
					Server.app.use(routePrefix, gaDf);
				}

				// for default route
				const filteredKeys = Object.entries(default_route)
					.filter(([key, value]) => value.length > 0)
					.map(([key]) => key);
				const rDf = Server.express.Router({
					mergeParams: true
				});
				for (const k of filteredKeys) {
					const arrData = default_route[k];
					for (const routeId of arrData) {
						const routeInstanced = routes[routeId];
						if (is_function(routeInstanced.getRouteData)) {
							const { method, url, callback, internal_middlewares, as = '', regex, match, params, full_path } = routeInstanced.getRouteData();
							let routeAs = as;
							if (!empty(routeAs)) {
								// replace duplicate dots
								routeAs = routeAs.replace(/\.+/g, '.');
								// remove last dot
								if (routeAs.endsWith('.')) {
									routeAs = routeAs.slice(0, -1);
								}
								// remove first dot
								if (routeAs.startsWith('.')) {
									routeAs = routeAs.slice(1);
								}

								// set route
								if (routeAs in Server.#routes) {
									console.warn(`${routeAs} already exists in routes`);
								} else {
									Server.#routes[routeAs] = {
										full_path: path.join(routePrefix, full_path),
										...params,
									}
								}
							}
							// regex
							if (!empty(regex)) {
								const regexHandler = new ExpressRegexHandler(regex);
								const regexMiddleware = regexHandler.applyRegex();
								internal_middlewares.unshift(regexMiddleware);
							}
							rDf[method](url, ...internal_middlewares, callback);
							if (is_array(match) && !empty(match)) {
								for (const m of match) {
									rDf[m](url, ...internal_middlewares, callback);
								}
							}
						}
					}
				}
				Server.app.use(routePrefix, rDf);
			}
		}

		Server.#finishBoot();
	}
}

export default Server;
