const MiddlewareHandler = require("../../../../../app/MiddlewareHandler");
const ExpressClosure = require("../../../http/ExpressClosure");
const ExpressRedirect = require("../../../http/ExpressRedirect");
const ExpressRequest = require("../../../http/ExpressRequest");
const ExpressResponse = require("../../../http/ExpressResponse");
const ExpressView = require("../../../http/ExpressView");

class RouteMiddleware {
    #middlewares = [];
    constructor(handler) {
        this.#middlewareCreate(handler);
        return this.#middlewares;
    }

    #middlewareCreate(handler) {
        let middleware;
        if (isset(handler)) {
            if (is_array(handler)) {
                handler.forEach(element => {
                    this.#middlewareCreate(element);
                });
            } else if (is_string(handler)) {
                const middlewareHandler = new MiddlewareHandler();
                const middlewareAliases = middlewareHandler.middlewareAliases();
                if (isset(middlewareAliases[handler])) {
                    const classUsed = middlewareAliases[handler];
                    if (method_exist(classUsed, 'handle') && is_function(classUsed.handle)) {
                        middleware = classUsed.handle;
                    }
                }
            } else if (is_function(handler)) {
                middleware = handler;
            }
        }
        if (isset(middleware) && is_function(middleware)) {
            const newCallback = async (req, res, next) => {
                $_POST = req.body || {};
                $_GET = req.query || {};
                $_FILES = req.files || {};
                $_COOKIE = req.cookies || {};
                const methodType = req.method.toUpperCase();
                const REQUEST = {
                    method: methodType,
                    params: req.params,
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
                const middlewareInitiator = () => {
                    return new ExpressClosure();
                }
                request = (getInput = '') => {
                    if (!is_string(getInput)) {
                        return rq;
                    } else {
                        return rq.input(getInput);
                    }
                }
                const expressResponse = await middleware(rq, middlewareInitiator);
                const { html_dump, json_dump } = res.responses;
                if (res.headersSent) {
                    return;
                }
                if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressRedirect || expressResponse instanceof ExpressClosure || expressResponse instanceof ExpressView)) {
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
                    } else if (expressResponse instanceof ExpressClosure) {
                        if (expressResponse.next) {
                            next();
                        }
                    }
                } else {
                    res.status(200);
                    res.set('Content-Type', isRequest() ? 'application/json' : 'text/html');
                    json_dump.push(expressResponse)
                    html_dump.push(expressResponse);
                    if (isRequest()) {
                        res.json(json_dump.length === 1 ? json_dump[0] : json_dump);
                    }
                    else {
                        res.send(html_dump.join(''));
                    }
                }
                return;
            }
            this.#middlewares.push(newCallback);
        }
    }
}

module.exports = RouteMiddleware;