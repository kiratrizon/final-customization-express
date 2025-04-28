const path = require('path');
const ExpressResponse = require('../../../http/ExpressResponse');
const ExpressRedirect = require('../../../http/ExpressRedirect');
const ExpressView = require('../../../http/ExpressView');
const RouteMiddleware = require('../middleware');
const ExpressRequest = require('../../../http/ExpressRequest');

class RouteMethod {
    constructor(config = {}) {
        this.#processMethods(config);
    }


    // store route
    #processMethods(config = {}) {
        const { method, url, callback, currentGroup, hasMatch } = config;
        let cpath = url;
        let newCallback = null;
        const pathCheckerForRegex = path.join(currentGroup, cpath);
        if (is_function(callback)) {
            newCallback = async (req, res) => {
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
                $_POST = req.body || {};
                $_GET = req.query || {};
                $_FILES = req.files || {};
                $_COOKIE = req.cookies || {};
                const methodType = req.method.toUpperCase();
                const REQUEST = {
                    method: methodType,
                    params: { ...req.params },
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
                const regex = /{\/?:([\w-]+)\??}|:(\w+)/g;

                const keys = [];
                let match;

                while ((match = regex.exec(pathCheckerForRegex)) !== null) {
                    const key = match[1] ?? match[2]; // nullish coalescing
                    if (key) keys.push(key);
                }

                const params = {};
                keys.forEach((key) => {
                    params[key] = rq.request.params[key] || null;
                })
                const expressResponse = await callback(rq, ...Object.values(params));
                const { html_dump, json_dump } = res.responses;
                if (res.headersSent) {
                    return;
                }
                if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressRedirect || expressResponse instanceof ExpressView)) {
                    if (expressResponse instanceof ExpressResponse) {
                        const { html, json, headers, statusCode, returnType } = expressResponse.accessData();
                        if (returnType === 'html') {
                            html_dump.push(html);
                            res.status(statusCode || 200);
                            res.set(headers);
                            res.send(html_dump.join(''));
                        } else if (returnType === 'json') {
                            json_dump.push(json);
                            res.status(statusCode);
                            res.set(headers);
                            res.json(json_dump.length === 1 ? json_dump[0] : json_dump);
                        }
                    } else if (expressResponse instanceof ExpressRedirect) {
                        const { url, statusCode } = expressResponse;
                        res.redirect(statusCode, url);
                    } else if (expressResponse instanceof ExpressView) {
                        res.status(200);
                        res.set('Content-Type', 'text/html');
                        const rendered = expressResponse.getRendered();
                        html_dump.push(rendered);
                        res.send(html_dump.join(''));
                    }
                } else {
                    res.status(200);
                    res.set('Content-Type', isRequest() ? 'application/json' : 'text/html');
                    json_dump.push(expressResponse)
                    html_dump.push(JSON.stringify(expressResponse));
                    if (isRequest()) {
                        res.json(json_dump.length === 1 ? json_dump[0] : json_dump);
                    }
                    else {
                        res.send(html_dump.join(''));
                    }
                }
                return;
            }
        }
        if (is_function(newCallback)) {
            this.#routeData['method'] = method.toLowerCase();
            this.#routeData['path'] = url;
            this.#routeData['callback'] = newCallback;
            if (is_array(hasMatch) && hasMatch.length > 0) {
                this.#routeData['match'] = hasMatch;
            }
        }
    }

    #routeData = {
        'internal_middlewares': [],
        'regex': {},
        'as': null,
        'match': null,
    }

    middleware(middleware) {
        const middlewareResult = new RouteMiddleware(middleware)
        this.#routeData['internal_middlewares'].push(...middlewareResult);
        return this;
    }
    name(name) {
        if (is_string(name) && name.length) {
            this.#routeData['as'] = name;
        }
        return this;
    }
    where(regex = {}) {
        if (is_object(regex)) {
            this.#routeData['regex'] = regex;
        }
        return this;
    }

    getRouteData() {
        return this.#routeData;
    }
}

module.exports = RouteMethod;