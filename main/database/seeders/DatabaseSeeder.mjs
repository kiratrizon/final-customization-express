import Seeder from "../../base/Seeder.mjs";
import UserFactory from "../factories/UserFactory.mjs";

class DatabaseSeeder extends Seeder {

    async run() {
        await UserFactory.create(100);
    }
}

export default DatabaseSeeder;