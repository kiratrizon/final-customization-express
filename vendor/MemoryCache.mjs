import Redis from './Redis.mjs';


class MemoryCache {
    #cache = new Map();
    #expiration = 1800;

    constructor(expiration) {
        if (!isNaN(expiration)) {
            this.#expiration = expiration;
        }
    }

    setExpiration(time) {
        if (!isNaN(time)) {
            this.#expiration = time;
        }
    }

    // Asynchronous set operation
    async set(key, value) {
        const expirationTime = Date.now() + this.#expiration * 1000;
        return new Promise((resolve) => {
            this.#cache.set(key, { value, expirationTime });
            resolve();
        });
    }

    // Asynchronous get operation
    async get(key) {
        return new Promise((resolve) => {
            const cachedItem = this.#cache.get(key);
            if (cachedItem) {
                if (Date.now() < cachedItem.expirationTime) {
                    resolve(cachedItem.value);
                } else {
                    this.#cache.delete(key);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }

    // Asynchronous delete operation
    async delete(key) {
        return new Promise((resolve) => {
            this.#cache.delete(key);
            resolve();
        });
    }
}

let cache;
if (env('USE_MEMORY_CACHE') === 'true') {
    cache = MemoryCache;
} else {
    cache = Redis;
}

export default cache;