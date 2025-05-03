class ConstructorModel {
    #privates = [];
    makeVisible(key) {
        // splice the key from $this.#privates array
        if (this.#privates.indexOf(key) !== -1) {
            this.#privates.splice(this.#privates.indexOf(key), 1);
        }
        return this;
    }
    makeHidden(key) {
        // push the key to $this.#privates array
        if (this.#privates.indexOf(key) === -1) {
            this.#privates.push(key);
        }
        return this;
    }
    setHidden(data = []) {
        this.#privates = [...this.#privates, ...data];
        return this;
    }
    toJson() {
        const data = {};
        for (const key in this) {
            if (Object.hasOwn(this, key) && !this.#privates.includes(key)) {
                data[key] = this[key];
            }
        }
        return data;
    }

    toArray() {
        return this.toJson();
    }

}

export default ConstructorModel;