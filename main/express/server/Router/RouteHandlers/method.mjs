import ExpressResponse from '../../../http/ExpressResponse.mjs';
import ExpressRedirect from '../../../http/ExpressRedirect.mjs';
import ExpressView from '../../../http/ExpressView.mjs';
import RouteMiddleware from './middleware.mjs';


class RouteMethod {
    constructor(config = {}) {
        this.#processMethods(config);
    }


    // store route
    #processMethods(config = {}) {
        const { method, urlProps, callback, groupProps, hasMatch } = config;
        let url = urlProps.string;
        let currentGroup = groupProps.string;
        let optionalParams = [...groupProps.optionalParams, ...urlProps.optionalParams];
        let requiredParams = [...groupProps.requiredParams, ...urlProps.requiredParams];
        let newCallback = null;
        const pathChecker = [currentGroup, url].join('').replace(/[{}]/g, '').replace(/\*\d+\*/g, '').replace(/\/+/g, '/');
        if (is_function(callback)) {
            newCallback = async (req, res) => {
                request().request.params = { ...req.params }
                const rq = request();
                const keys = [...pathChecker.matchAll(/:([a-zA-Z0-9_]+)/g)].map(match => match[1]);
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
                        const { html, json, file, download, streamDownload, error, headers, statusCode, returnType } = expressResponse.accessData();
                        res.set(headers).status(statusCode);
                        if (isset(error)) {
                            res.send(error);
                            return;
                        } else {
                            if (returnType === 'html') {
                                html_dump.push(html);
                                res.send(html_dump.join(''));
                                return;
                            } else if (returnType === 'json') {
                                json_dump.push(json);
                                res.json(json_dump.length === 1 ? json_dump[0] : json_dump);
                                return;
                            } else if (returnType === 'file') {
                                res.sendFile(file);
                                return;
                            } else if (returnType === 'download') {
                                res.download(...download);
                                return;
                            }
                        }
                    } else if (expressResponse instanceof ExpressRedirect) {
                        const { url, statusCode } = expressResponse;
                        res.redirect(statusCode, url);
                        return;
                    } else if (expressResponse instanceof ExpressView) {
                        res.status(200);
                        res.set('Content-Type', 'text/html');
                        const rendered = expressResponse.getRendered();
                        html_dump.push(rendered);
                        res.send(html_dump.join(''));
                        return;
                    }
                } else {
                    res.status(200);
                    res.set('Content-Type', isRequest() ? 'application/json' : 'text/html');
                    json_dump.push(expressResponse)
                    html_dump.push(JSON.stringify(expressResponse));
                    if (isRequest()) {
                        res.json(json_dump.length === 1 ? json_dump[0] : json_dump);
                        return;
                    }
                    else {
                        res.send(html_dump.join(''));
                        return;
                    }
                }
                return;
            }
        }
        if (is_function(newCallback)) {
            this.#routeData['method'] = method.toLowerCase();
            this.#routeData['url'] = url;
            this.#routeData['callback'] = newCallback;
            if (is_array(hasMatch) && hasMatch.length > 0) {
                this.#routeData['match'] = hasMatch;
            }
            this.#routeData['full_path'] = pathChecker + '/';
            this.#routeData['params'] = {
                'required': requiredParams,
                'optional': optionalParams,
            }
        }
    }

    #routeData = {
        'internal_middlewares': [],
        'regex': {},
        'as': '',
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

export default RouteMethod;