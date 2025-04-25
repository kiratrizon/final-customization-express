const ExpressHeader = require("./ExpressHeader");

class ExpressRequest {
    #post;
    #get;
    #files;
    headers;
    header;
    route;
    constructor(rq = {}) {
        this.#post = rq.body || {};
        this.#get = rq.query || {};
        this.#files = rq.files || {};
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
}

module.exports = ExpressRequest;