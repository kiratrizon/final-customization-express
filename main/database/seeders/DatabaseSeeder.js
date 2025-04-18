const Seeder = require("../../base/Seeder");
const AdminFactory = require("../factories/AdminFactory");
const UserFactory = require("../factories/UserFactory");
const PostFactory = require("../factories/PostFactory");

class DatabaseSeeder extends Seeder {

    run() {
        let userData = UserFactory.create(20);
        let adminData = AdminFactory.create(20);
        // DB.statement("TRUNCATE TABLE posts");
        let postsData = PostFactory.create(200);
    }
}

module.exports = DatabaseSeeder;