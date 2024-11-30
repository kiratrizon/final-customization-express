class ConstructorModel {
    // all instantiated methods here
    #identifier;
    #primaryValue = null;
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
}

module.exports = ConstructorModel;