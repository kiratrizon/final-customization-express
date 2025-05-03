import { createClient } from 'redis';

const redisConfig = await config('app.redis');

class Redis {
    #client = null;
    #isConnected = false;
    // 30 mins
    #expiration = 1800; // seconds

    constructor(expiration) {
        if (!isNaN(expiration)) {
            this.#expiration = expiration; // seconds
        }
    }

    // Initialize Redis client
    async #init() {
        if (this.#client && this.#isConnected) return;
        this.#client = createClient(redisConfig);

        this.#client.on('error', err => {
            console.error('Redis Client Error:', err);
            this.#isConnected = false;
        });

        this.#client.on('connect', () => {
            this.#isConnected = true;
        });

        try {
            // Ensure connection is established
            if (!this.#isConnected) {
                await this.#client.connect();
                this.#isConnected = true;
            }
        } catch (error) {
            console.error('Error connecting to Redis:', error);
        }
    }

    setExpiration(time) {
        this.#expiration = time;
    }

    async set(key, value) {
        await this.#init();
        try {
            if (this.#expiration) {
                // Use SETEX to set value and expiration in one call
                await this.#client.setEx(key, this.#expiration, json_encode(value));
            } else {
                await this.#client.set(key, json_encode(value));
            }
        } catch (error) {
            console.error(`Error setting key ${key}:`, error);
        }
    }

    async get(key) {
        await this.#init();
        try {
            const data = await this.#client.get(key);
            return json_decode(data);
        } catch (error) {
            console.error(`Error getting key ${key}:`, error);
            return null;
        }
    }

    async delete(key) {
        await this.#init();
        try {
            await this.#client.del(key);
        } catch (error) {
            console.error(`Error deleting key ${key}:`, error);
        }
    }
}

export default Redis;
