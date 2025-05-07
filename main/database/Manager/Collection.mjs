class Collection {

    #instancedModel = null;
    #guarded = [];
    #fillable = [];
    #hidden = [];
    #timestamp = true;
    #table;
    #staticModel
    constructor(prop) {
        this.#staticModel = prop;
        this.#instancedModel = new prop();
        this.#table = this.#instancedModel.table || generateTableNames(prop.name);
        this.#guarded = this.#instancedModel.guarded;
        this.#fillable = this.#instancedModel.fillable;
        this.#hidden = this.#instancedModel.hidden;
        this.#timestamp = this.#instancedModel.timestamp;
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

                // get model
                const model = this.#instanceModel(this.#staticModel);
                if (method_exist(model, 'setHidden')) {
                    model.setHidden(this.#hidden);
                }
                Object.assign(model, item);
                newData.push(model);
            });
        }
        return newData;
    }

    many(data) {
        data = this.#validateData(data);
        return data || [];
    }

    #instanceModel(model) {
        this.#instancedModel = new model();
        // delete properties of model
        delete this.#instancedModel.guarded;
        delete this.#instancedModel.fillable;
        delete this.#instancedModel.hidden;
        delete this.#instancedModel.timestamp;
        delete this.#instancedModel.table;
        delete this.#instancedModel.factory;

        return this.#instancedModel;
    }

    validateFillableGuard(validateData = []) {
        if (!Array.isArray(validateData)) {
            return null;  // Ensure the input is an array.
        }

        const fillable = this.#fillable;
        if (this.#staticModel.softDelete) {
            fillable.push('deleted_at');
        }
        const guarded = this.#guarded;

        for (const data of validateData) {
            const keys = Object.keys(data);
            keys.forEach((key) => {
                // if key is in guarded, throw error
                if (guarded.includes(key)) {
                    throw new Error(`The ${key} field is guarded and cannot be mass assigned.`);
                }
                // if key is not in fillable, throw error
                if (!fillable.includes(key)) {
                    throw new Error(`The ${key} field is not fillable.`);
                }
                // if undefined, throw error
                if (data[key] === undefined) {
                    throw new Error(`The ${key} field is undefined.`);
                }
            });
        }

        return true;
    }
}

export default Collection;