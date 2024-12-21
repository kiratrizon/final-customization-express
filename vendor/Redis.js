const { createClient } = require('redis')
const redisConfig = config('app.redis');
class Redis {
    #client = createClient(redisConfig);
    #isConnected = false;
    #expiration = null; // seconds
    constructor() {
        this.#expiration = null;
        this.#client.on('error', err => console.log('Redis Client Error', err));
    }

    async #init() {
        if (!this.#isConnected) {
            await this.#client.connect();
            this.#isConnected = true;
        }
    }
    setExpiration(time) {
        this.#expiration = time;
    }
    async set(key, value) {
        await this.#init();
        if (this.#expiration) {
            await this.#client.set(key, value, 'EX', this.#expiration);
        } else {
            await this.#client.set(key, value);
        }
        await this.#close();
    }

    async get(key) {
        await this.#init();
        const data = await this.#client.get(key);
        await this.#close();
        return data;
    }

    async #close() {
        if (this.#isConnected) {
            await this.#client.quit();
            this.#isConnected = false;
        }
    }

    client() {
        return this.#client;
    }
}

module.exports = Redis;