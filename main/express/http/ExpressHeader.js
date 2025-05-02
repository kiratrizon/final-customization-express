class ExpressHeader {

    #header = {};
    constructor(header = {}) {
        this.#header = header;
    }
    all() {
        return this.#header;
    }

}

module.exports = ExpressHeader;