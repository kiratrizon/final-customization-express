import Seeder from "../../base/Seeder.mjs";
import AdminFactory from "../factories/AdminFactory.mjs";
import UserFactory from "../factories/UserFactory.mjs";
import PostFactory from "../factories/PostFactory.mjs";

class DatabaseSeeder extends Seeder {

    async run() {
        let userData = await UserFactory.create(20);
        let adminData = await AdminFactory.create(20);
        let postsData = await PostFactory.create(200);
    }
}

export default DatabaseSeeder;