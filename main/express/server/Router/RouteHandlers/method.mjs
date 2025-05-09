import ExpressResponse from '../../../http/ExpressResponse.mjs';
import ExpressRedirect from '../../../http/ExpressRedirect.mjs';
import ExpressView from '../../../http/ExpressView.mjs';
import RouteMiddleware from './middleware.mjs';
import Configure from '../../../../../libraries/Materials/Configure.mjs';
import Auth from '../../Auth.mjs';


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
                req.request.request.params = { ...req.params }
                const rq = req.request;
                rq.auth = () => new Auth(rq);
                const keys = [...pathChecker.matchAll(/:([a-zA-Z0-9_]+)/g)].map(match => match[1]);
                const params = {};
                keys.forEach((key) => {
                    params[key] = rq.request.params[key] || null;
                })
                let expressResponse = null;
                let good = true;
                try {
                    expressResponse = await callback(rq, ...Object.values(params));
                } catch (error) {
                    good = false;
                    expressResponse = error;
                }
                const { html_dump, json_dump } = res.responses;
                if (res.headersSent) {
                    return;
                }
                if (!good) {
                    let message;
                    let stack;
                    if (expressResponse instanceof Error) {
                        message = expressResponse.message;
                        stack = expressResponse.stack.split('\n').map(line => line.trim());
                    } else {
                        message = expressResponse;
                    }
                    if (!rq.isRequest()) {
                        res.setHeader('Content-Type', 'text/html');
                        res.status(404).send('Server Error');
                    } else {
                        res.status(404).json({ message: 'Server Error' });
                    }
                    log({ message, stack }, 'error', `${date('Y-m-d H:i:s')} Request URI ${rq.request.originalUrl} - ${rq.request.method}`);
                    return;
                }
                if (is_object(expressResponse) && (expressResponse instanceof ExpressResponse || expressResponse instanceof ExpressRedirect || expressResponse instanceof ExpressView)) {
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
                        const rendered = expressResponse.rendered;
                        html_dump.push(rendered);
                        res.send(html_dump.join(''));
                    }
                } else {
                    res.status(200);
                    res.set('Content-Type', rq.isRequest() ? 'application/json' : 'text/html');
                    json_dump.push(expressResponse)
                    html_dump.push(JSON.stringify(expressResponse));
                    if (rq.isRequest()) {
                        res.json(json_dump.length === 1 ? json_dump[0] : json_dump);
                    }
                    else {
                        res.send(html_dump.join(''));
                    }
                }
                Configure.reset();
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
        const result = middlewareResult.getMiddlewares();
        this.#routeData['internal_middlewares'].push(...result);
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