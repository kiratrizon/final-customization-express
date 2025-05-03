import { faker } from '@faker-js/faker';
import DatabaseManager from '../database/Manager/DatabaseManager.mjs';


class Factory {
    faker = faker;

    static async create(c = 1) {
        const factory = new this();
        const model = factory.model;
        if (!model.factory) {
            console.warn(`Please define the factory for ${model.name} Model.\nclass ${model.name} {\n   static factory = true; // required\n   ...\n}`);
            return;
        }
        const counters = await Factory.#limitter(c);
        const allData = [];
        console.log('Inserting');
        for (let count of counters) {
            const createdData = [];
            for (let i = 0; i < count; i++) {
                const data = factory.definition();
                createdData.push(data);
            }
            await model.insert(createdData);
            const getInsertedAgain = await model.orderBy('id', 'desc').limit(count).get();
            allData.push(...getInsertedAgain);
        }
        console.log('Inserted', c, 'records');
        const db = new DatabaseManager();
        await db.close();
        return allData;
    }

    static async #limitter(count) {
        const arrCount = [];
        const factoryLimit = await config('factory.limit') || 500;

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

export default Factory;