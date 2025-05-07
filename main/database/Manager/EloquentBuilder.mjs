import QueryBuilder from "./QueryBuilder.mjs";

class EloquentBuilder {
    #staticModel;
    constructor(model) {
        this.#staticModel = model;
    }

    async create(data) {
        const builder = new QueryBuilder(this.#staticModel);
        return await builder.insert(data, true);
    }


    async find(id = null) {
        if (empty(id)) {
            return null;
        }
        const builder = new QueryBuilder(this.#staticModel);
        builder.where('id', id);
        return await builder.first();
    }

    async findOrFail(id = null) {
        const data = await this.find(id);
        if (empty(data)) {
            throw new Error(`Model not found with id: ${id}`);
        }
        return data;
    }
}

export default EloquentBuilder;