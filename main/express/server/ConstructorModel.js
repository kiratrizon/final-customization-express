class ConstructorModel {
    // all instantiated methods here
    #identifier;
    setIdentifier(identifier) {
        this.#identifier = identifier;
    }
    getIdentifier() {
        return this.#identifier;
    }
}

module.exports = ConstructorModel;