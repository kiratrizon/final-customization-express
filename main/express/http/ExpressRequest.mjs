import Validator from "../../../libraries/Services/Validator.mjs";
import ExpressHeader from "./ExpressHeader.mjs";


class ExpressRequest {
    #post;
    #get;
    #files;
    #cookies;
    headers;
    header;
    route;
    constructor(rq = {}) {
        this.#post = rq.body || {};
        this.#get = rq.query || {};
        this.#files = rq.files || {};
        this.#cookies = rq.cookies || {};
        this.request = rq;
        this.headers = new ExpressHeader(rq.headers || {});
        this.header = function (key = '') {
            if (key === '') return this.headers.all();
            return this.headers.all()[key] || null;
        }
        this.route = function (key) {
            return this.request['params'][key] || null;
        }
    }
    query(key = '') {
        if (key === '') return this.#get;
        return this.#get[key] ?? null;
    }
    input(key = '') {
        if (key === '') return this.#post;
        return this.#post[key] ?? null;
    }
    all() {
        return {
            ...this.#get,
            ...this.#post
        }
    }
    only(keys = []) {
        if (!Array.isArray(keys)) throw new Error('Keys must be an array');
        let data = {};
        keys.forEach(key => {
            if (this.#get[key] !== undefined) data[key] = this.#get[key];
            if (this.#post[key] !== undefined) data[key] = this.#post[key];
        });
        return data;
    }
    except(keys = []) {
        if (!Array.isArray(keys)) throw new Error('Keys must be an array');
        let data = {
            ...this.#get,
            ...this.#post
        };
        keys.forEach(key => {
            delete data[key];
        });
        return data;
    }
    file(key = '') {
        if (key === '') return this.#files;
        return this.#files[key] ?? null;
    }
    is(type) {
        if (is_array(type) || is_string(type)) {
            if (is_array(type)) {
                type = type.map(e => e.toLowerCase());
                return type.includes(this.request.method.toLowerCase());
            } else {
                return this.request.method.toLowerCase() === type.toLowerCase();
            }
        }
    }
    async validate(rules = {}) {
        if (!is_object(rules)) {
            throw new Error('Rules must be an object');
        }
        const keys = Object.keys(rules);
        const data = this.only(keys);
        const validator = await Validator.make(data, rules);
        if (validator.fails()) {
            response_error(validator.getErrors());
        }
        return data;
    }
}

export default ExpressRequest;