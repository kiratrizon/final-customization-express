class Collection {

    #isModel;
    #model = null;
    #guarded = [];
    #fillable = [];
    #hidden = [];
    #timestamp = true;
    #modelTable;
    constructor(prop) {
        this.#model = new prop();
        this.#modelTable = this.#model.table || generateTableNames(prop.name);
        this.#guarded = this.#model.guarded;
        this.#fillable = this.#model.fillable;
        this.#hidden = this.#model.hidden;
        this.#timestamp = this.#model.timestamp;

        // delete properties of model
        delete this.#model.guarded;
        delete this.#model.fillable;
        delete this.#model.hidden;
        delete this.#model.timestamp;
        delete this.#model.table;
        delete this.#model.factory;
    }

    // this is for models only
    one(data) {
        data = this.#validateData(data);
        return data[0] || null;
    }

    #validateData(data = []) {
        if (!is_array(data)) {
            throw new Error('Data must be an array');
        }
        const newData = [];
        if (data.length) {
            data.forEach((item) => {
                // hiddens
                const hiddenData = {};
                this.#hidden.forEach((e) => {
                    if (item[e]) {
                        hiddenData[e] = item[e];
                        delete item[e];
                    }
                });
                // get model
                const model = this.#model;
                if (method_exist(model, 'setHidden')) {
                    model.setHidden(hiddenData);
                }
                Object.assign(model, item);
                // push to newData
                newData.push(model);
            });
        }
        return newData;
    }

    many(data) {
        data = this.#validateData(data);
        return data || [];
    }
}

module.exports = Collection;