const { th } = require("@faker-js/faker");

class ExpressRequest {
    #post;
    #get;
    #files;
    constructor(rq = {}) {
        this.#post = rq.body ?? {};
        this.#get = rq.query ?? {};
        this.#files = rq.files ?? {};
        this.http_request = rq;
    }
    query(key = ''){
        if (key === '') return this.#get;
        return this.#get[key] ?? null;
    }
    input(key = ''){
        if (key === '') return this.#post;
        return this.#post[key] ?? null;
    }
    all(){
        return {
            ...this.#get,
            ...this.#post
        }
    }
    only(keys = []){
        if (!Array.isArray(keys)) throw new Error('Keys must be an array');
        let data = {};
        keys.forEach(key => {
            if (this.#get[key] !== undefined) data[key] = this.#get[key];
            if (this.#post[key] !== undefined) data[key] = this.#post[key];
        });
        return data;
    }
    except(keys = []){
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
}

module.exports = ExpressRequest;