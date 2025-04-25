class ConstructorModel {
    #privates = {};
    makeVisible(key) {
        this[key] = this.#privates[key];
    }
    makeHidden(key) {
        delete this[key];
    }
    setHidden(data) {
        this.#privates = { ...this.#privates, ...data };
    }
}

module.exports = ConstructorModel;