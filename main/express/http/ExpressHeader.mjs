class ExpressHeader {

    #header;
    constructor(header) {
        /** @type {import('http').IncomingHttpHeaders} */
        this.#header = header;
    }
    all() {
        return this.#header;
    }

}

export default ExpressHeader;