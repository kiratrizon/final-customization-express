const auth = await config('auth');
import Guard from './Guard.mjs';


class GuardInitiator {
    #driver;
    #model;
    #table;
    #driverType;
    constructor(guard) {
        this.#driver = auth.guards[guard].driver;
        const providerKey = auth.guards[guard].provider;
        this.#driverType = auth.providers[providerKey].driver;
        if (this.#driverType === 'eloquent') {
            this.#model = auth.providers[providerKey].model;
        } else {
            this.#table = auth.providers[providerKey].table;
        }
    }

    init() {
        if (this.#driverType === 'eloquent') {
            return new Guard(this.#driver, this.#model, this.#driverType);
        } else {
            return new Guard(this.#driver, this.#table, this.#driverType);
        }
    }

}

export default GuardInitiator;
