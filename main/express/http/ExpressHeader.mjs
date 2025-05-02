class ExpressHeader {

    #header = {};
    constructor(header = {}) {
        this.#header = header;
    }
    all() {
        return this.#header;
    }

}

export default ExpressHeader;