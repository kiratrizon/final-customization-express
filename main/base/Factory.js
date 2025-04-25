const { faker } = require('@faker-js/faker');
const QueryBuilder = require('../../main/database/Manager/QueryBuilder');

class Factory {
    faker = faker;

    static async create(c = 1) {
        const factory = new this();
        const model = factory.model;
        if (!model.factory) {
            console.warn(`Please define the factory for ${model.name} Model.\nclass ${model.name} {\n   static factory = true; // required\n   ...\n}`);
            return;
        }
        const counters = Factory.#limitter(c);
        const allData = [];
        console.log('Inserting');
        for (let count of counters) {
            const createdData = [];
            for (let i = 0; i < count; i++) {
                const data = factory.definition();
                console.log(data);
                createdData.push(data);
            }
            await model.insert(createdData);
            const getInsertedAgain = await model.orderBy('id', 'desc').limit(count).get();
            // getInsertedAgain.forEach((e) => {
            //     const modelData = new QueryBuilder(model);
            //     allData.unshift(modelData.factoryFind(e));
            // });
        }
        console.log('Inserted', c, 'records');
        return allData;
    }

    static #limitter(count) {
        const arrCount = [];
        const factoryLimit = config('factory.limit') || 500;

        while (count > factoryLimit) {
            arrCount.push(factoryLimit);
            count -= factoryLimit;
        }
        if (count > 0) {
            arrCount.push(count)
        }
        return arrCount || [];
    }
}

module.exports = Factory;