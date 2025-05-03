import MiddlewareHandler from "../../../../../app/MiddlewareHandler.mjs";
import ExpressClosure from "../../../http/ExpressClosure.mjs";
import ExpressRedirect from "../../../http/ExpressRedirect.mjs";
import ExpressResponse from "../../../http/ExpressResponse.mjs";
import ExpressView from "../../../http/ExpressView.mjs";


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
                const getMiddleware = middlewareHandler.getMiddleware(handler)
                if (isset(getMiddleware)) {
                    const classUsed = getMiddleware;
                    if (method_exist(classUsed, 'handle') && is_function(classUsed.handle)) {
                        // middleware = classUsed.handle;
                        // bind
                        middleware = classUsed.handle.bind(classUsed);
                    }
                }
            } else if (is_function(handler)) {
                middleware = handler;
            }
        }
        if (isset(middleware) && is_function(middleware)) {
            const newCallback = async (req, res, next) => {
                const rq = request();
                const middlewareInitiator = () => {
                    return new ExpressClosure();
                }
                const expressResponse = await middleware(rq, middlewareInitiator);
                const { html_dump, json_dump } = res.responses;
                if (res.headersSent) {
                    return;
                }
                if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressRedirect || expressResponse instanceof ExpressClosure || expressResponse instanceof ExpressView)) {
                    if (expressResponse instanceof ExpressResponse) {
                        const { html, json, file, download, error, headers, statusCode, returnType } = expressResponse.accessData();
                        res.set(headers).status(statusCode);
                        if (isset(error)) {
                            res.send(error);
                        } else {
                            if (returnType === 'html') {
                                html_dump.push(html);
                                res.send(html_dump.join(''));
                            } else if (returnType === 'json') {
                                json_dump.push(json);
                                res.json(json_dump.length === 1 ? json_dump[0] : json_dump);
                            } else if (returnType === 'file') {
                                res.sendFile(file);
                            } else if (returnType === 'download') {
                                res.download(...download);
                            }
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

export default RouteMiddleware;