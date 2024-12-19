const {faker} = require('@faker-js/faker');

class Factory {
    faker = faker;

    static async create(count = 1){
        const factory = new this();
        const model = factory.model;
        if (!model.factory){
            console.warn("The factory is already defined.");
            return;
        }
        const createdData = [];
        for (let i = 0; i < count; i++) {
            const data = await factory.definition();
            const created = await model.create(data);
            createdData.push(created);
        }
        return createdData;
    }

    static async createBulk(count = 1){
        const factory = new this();
        const model = factory.model;
        if (!model.factory){
            console.warn("The factory is already defined.");
            return;
        }
        const createdData = [];
        for (let i = 0; i < count; i++) {
            const data = await factory.definition();
            createdData.push(data);
        }
        const created = await model.insert(createdData);

        return created;
    }
}

module.exports = Factory;