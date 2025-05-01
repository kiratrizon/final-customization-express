class StreamDownload {

    #text = '';
    constructor() {

    }

    set(text) {
        this.#text += text;
    }

    get() {
        return this.#text;
    }
}

module.exports = StreamDownload;