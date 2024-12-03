class ConstructorModel {
    // all instantiated methods here
    #identifier;
    #primaryValue = null;
    #queriedValue = {};
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
    setPrivates(data = {}){
        Object.assign(this.#queriedValue, data);
    }

    getPrivates(){
        return this.#queriedValue;
    }
}

module.exports = ConstructorModel;