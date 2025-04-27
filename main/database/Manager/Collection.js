class Collection {

    #isModel;
    #instancedModel = null;
    #guarded = [];
    #fillable = [];
    #hidden = [];
    #timestamp = true;
    #table;
    constructor(prop) {
        this.#instancedModel = new prop();
        this.#table = this.#instancedModel.table || generateTableNames(prop.name);
        this.#guarded = this.#instancedModel.guarded;
        this.#fillable = this.#instancedModel.fillable;
        this.#hidden = this.#instancedModel.hidden;
        this.#timestamp = this.#instancedModel.timestamp;

        // delete properties of model
        delete this.#instancedModel.guarded;
        delete this.#instancedModel.fillable;
        delete this.#instancedModel.hidden;
        delete this.#instancedModel.timestamp;
        delete this.#instancedModel.table;
        delete this.#instancedModel.factory;
    }

    // this is for models only
    one(data) {
        data = this.#validateData(data);
        return data[0] || null;
    }

    #validateData(data = []) {
        if (!is_array(data)) {
            return [];
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
                const model = this.#instancedModel;
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