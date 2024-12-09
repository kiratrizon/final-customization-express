class ConstructorModel {
    // all instantiated methods here
    #identifier;
    #primaryValue = null;
    #privates = {};
    #hiddens = {};
    setIdentifier(identifier) {
        this.#identifier = identifier;
        if (identifier) {
            this.#primaryValue = this[this.#identifier];
        }
    }
    getIdentifier() {
        return this.#identifier;
    }
    getPrimaryValue() {
        return this.#primaryValue;
    }
    setPrivates(data = {}, hiddens = {}) {
        Object.assign(this.#privates, data);
        Object.assign(this.#hiddens, hiddens);
    }

    getPrivates() {
        return this.#privates;
    }
    getHiddens() {
        return this.#hiddens;
    }

    getProtected(key) {
        return this.#hiddens[key];
    }
}

module.exports = ConstructorModel;