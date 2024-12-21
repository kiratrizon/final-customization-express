const Seeder = require("../../base/Seeder");
const AdminFactory = require("../factories/AdminFactory");
const UserFactory = require("../factories/UserFactory");
const PostFactory = require("../factories/PostFactory");
const DB = require("../../../libraries/Materials/DB");

class DatabaseSeeder extends Seeder {

    async run() {
        let userData = await UserFactory.create(20);
        let adminData = await AdminFactory.create(20);
        // DB.statement("TRUNCATE TABLE posts");
        let postsData = await PostFactory.create(200);
    }
}

module.exports = DatabaseSeeder;