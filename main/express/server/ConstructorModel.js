class ConstructorModel {
    // all instantiated methods here
    #identifier;
    #primaryValue = null;
    #privates = {};
    #privateArea = {};
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
    setPrivates(data = {}) {
        Object.assign(this.#privates, data);
    }

    getPrivates() {
        return this.#privates;
    }
}

module.exports = ConstructorModel;