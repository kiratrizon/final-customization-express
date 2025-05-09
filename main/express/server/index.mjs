import './express-declare.mjs';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import morgan from 'morgan';
import Boot from '../../../libraries/Services/Boot.mjs';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import express from 'express';
import util from 'util';
import fs from 'fs';

// type
/**
 * @type {typeof import('../../../libraries/Materials/Configure').default}
 */
const Configure = (await import('../../../libraries/Materials/Configure.mjs')).default;
/**
 * @type {typeof import('../http/ExpressFileHandler').default}
 */
const FileHandler = (await import('../http/ExpressFileHandler.mjs')).default;

/**
 * @type {typeof import('../http/ExpressRedirect').default}
 */
const ExpressRedirect = (await import('../http/ExpressRedirect.mjs')).default;

/**
 * @type {typeof import('../http/ExpressRegexHandler').default}
 */
const ExpressRegexHandler = (await import('../http/ExpressRegexHandler.mjs')).default;

/**
 * @type {typeof import('../http/ExpressResponse').default}
 */
const ExpressResponse = (await import('../http/ExpressResponse.mjs')).default;

/**
 * @type {typeof import('../http/ExpressView').default}
 */
const ExpressView = (await import('../http/ExpressView.mjs')).default;

/**
 * @type {typeof import('../http/ExpressRequest').default}
 */
const ExpressRequest = (await import('../http/ExpressRequest.mjs')).default;



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
		Server.app.use(Server.express.static(publicPath()));
		Server.app.use('/favicon.ico', Server.express.static(publicPath('favicon.ico')));
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
		Server.app.set('views', viewPath());
		Server.app.set('trust proxy', true);
		// console.log(redirect());

		// Global request/response handlers
		Server.app.use(async (req, res, next) => {
			Configure.reset();
			const toStr = (val) =>
				Array.isArray(val) ? val.join(', ') : (val || 'unknown').toString();

			const forServer = {
				SERVER_NAME: req.hostname,
				SERVER_ADDR: req.socket.localAddress || 'unknown',
				SERVER_PORT: req.socket.localPort?.toString() || 'unknown',
				SERVER_PROTOCOL: req.protocol || 'http',
				REQUEST_METHOD: req.method,
				QUERY_STRING: req.originalUrl.split('?')[1] || '',
				REQUEST_URI: req.originalUrl,
				DOCUMENT_ROOT: basePath(),
				HTTP_USER_AGENT: toStr(req.headers['user-agent']),
				HTTP_REFERER: toStr(req.headers['referer']),
				REMOTE_ADDR: req.ip || 'unknown',
				REMOTE_PORT: req.socket.remotePort?.toString() || 'unknown',
				SCRIPT_NAME: req.path,
				HTTPS: req.secure ? 'on' : 'off',
				HTTP_X_FORWARDED_PROTO: toStr(req.headers['x-forwarded-proto']),
				HTTP_X_FORWARDED_FOR: toStr(req.headers['x-forwarded-for']),
				REQUEST_TIME: date('Y-m-d H:i:s'),
				REQUEST_TIME_FLOAT: Date.now(),
				GATEWAY_INTERFACE: 'CGI/1.1',
				SERVER_SIGNATURE: 'X-Powered-By: Throy Tower',
				PATH_INFO: req.path,
				HTTP_ACCEPT: toStr(req.headers['accept']),
				'X-Request-ID': toStr(req.headers['x-request-id'] || Server.#generateRequestId()),
			};
			req.globals = {};
			req.phpGlobals = {
				$_SERVER: forServer,
				$_POST: {},
				$_GET: {},
				$_FILES: {},
				$_COOKIE: {},
			};
			req.phpGlobals.$_POST = req.body || {};
			req.phpGlobals.$_GET = req.query || {};
			req.phpGlobals.$_FILES = req.files || {};
			req.phpGlobals.$_COOKIE = req.cookies || {};
			const methodType = req.method.toUpperCase();

			/**
			 * @type {import("../http/ExpressRequest").RequestData}
			 */
			const REQUEST = {
				method: methodType,
				headers: req.headers,
				body: req.phpGlobals.$_POST,
				query: req.phpGlobals.$_GET,
				cookies: req.phpGlobals.$_COOKIE,
				path: req.path,
				originalUrl: req.originalUrl,
				ip: req.ip,
				protocol: req.protocol,
				files: req.phpGlobals.$_FILES,
			};
			const rq = new ExpressRequest(REQUEST);

			Boot.register();


			rq.isRequest = () => {
				if (req.xhr) {
					return true;
				}

				if (req.path.startsWith('/api/')) {
					return true;
				}

				if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
					return true;
				}

				if (req.is('json')) {
					return true;
				}

				return false;
			};

			req.headers['full-url'] = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

			// always refresh every request
			res.responses = {};
			res.responses.html_dump = [];
			res.responses.json_dump = [];

			Server.#baseUrl = `${req.protocol}://${req.get('host')}`;
			if (!isDefined('route')) {
				define('route', (name, args = {}) => {
					if (name in Server.#routes) {
						const { full_path, required = [], optional = [] } = Server.#routes[name];
						required.forEach((key) => {
							if (!(key in args)) {
								throw new Error(`Missing required parameter: ${key}`);
							}
						});

						let url = '';
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
				}, false);
			}

			const back = () => {
				return req.get('Referrer') || '/';
			};
			const redirect = (url = null) => {
				const instance = new ExpressRedirect(url);

				instance.back = () => {
					instance.url = back();
					return instance;
				};

				instance.route = (name, args = {}) => {
					instance.url = route(name, args);
					return instance;
				};

				return instance;
			}

			rq.redirect = redirect;

			req.request = rq;
			const renderData = (data, dumped = false) => {
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
					if (!rq.isRequest()) {
						res.setHeader('Content-Type', 'text/html');
						res.send(html);
					} else {
						res.setHeader('Content-Type', 'application/json');
						res.json(json);
					}
					res.end();
				}
			};
			rq.dump = (data) => renderData(data, true);
			rq.dd = (data) => {
				renderData(data);
			};

			rq.custom_error = function (errors = {}, data = {}) {
				if (rq.isRequest()) {
					res.status(422).json({ errors, data });
				} else {
					req.flash('errors', errors);
					res.redirect(422, back());
				}
			}
			next();
		});

		await Server.#loadAndValidateRoutes();
	}

	static #generateRequestId() {
		return 'req-' + Math.random().toString(36).substring(2, 15);
	}

	static async #handle() {
		let store;
		const redisConf = await config('app.redis');
		if (IN_PRODUCTION) {
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
				secure: IN_PRODUCTION,
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
			Server.app.use(async (req, res) => {
				const expressResponse = await Boot['notFound'](req.request);
				if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressView)) {
					if (expressResponse instanceof ExpressResponse) {
						const { html, statusCode, json, headers, returnType } = expressResponse.accessData();
						if (returnType === 'json') {
							res.status(statusCode).set(headers).json(json);
						} else if (returnType === 'html') {
							res.status(statusCode).set(headers).send(html);
						}
					} else if (expressResponse instanceof ExpressView) {
						const htmlResponse = expressResponse.rendered;
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

	static async #loadAndValidateRoutes() {
		const routePath = basePath('routes');
		const routeFiles = fs.readdirSync(routePath).filter(file => file.endsWith('.mjs'));
		// if web.mjs exists, remove it from the array
		const webIndex = routeFiles.indexOf('web.mjs');
		let webmjs = false;
		if (webIndex !== -1) {
			routeFiles.splice(webIndex, 1);
			webmjs = true;
		}
		if (webmjs) {
			// push it to the end of the array
			routeFiles.push('web.mjs');
		}

		for (const file of routeFiles) {
			const key = file.replace('.mjs', '');
			const routePrefix = key === 'web' ? '' : `/${key}`;
			const route = await dynamicImport(path.join(routePath, file));
			const instance = new route.default();
			const data = instance.reveal();
			if (data) {
				const { default_route, group, routes } = data;

				// console.log(data)
				// for group
				const groupIds = Object.keys(group);
				const gaDf = Server.express.Router();
				for (const id of groupIds) {
					const grDf = Server.express.Router({
						mergeParams: true
					});
					const instancedGroup = group[id];
					const { as = [], middlewares, childRoutes, groupName } = instancedGroup.getGroup();
					const groupRoute = groupName;
					let arrangeGroupRoute = groupRoute.replace(/\*\d+\*/g, '') || '/';
					arrangeGroupRoute = arrangeGroupRoute.replace(/\/+/g, '/');

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
								const allMiddlewares = [...middlewares, ...internal_middlewares];
								grDf[method](url, ...allMiddlewares, callback);
								if (is_array(match) && !empty(match)) {
									for (const m of match) {
										grDf[m](url, ...allMiddlewares, callback);
									}
								}
							}
						}
					}

					gaDf.use(arrangeGroupRoute, grDf);
				}
				Server.app.use(routePrefix, gaDf);

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
