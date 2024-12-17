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
        if (count == 1){
            return createdData[0];
        }
        return createdData;
    }
}

module.exports = Factory;