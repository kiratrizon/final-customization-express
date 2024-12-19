const Seeder = require("../../base/Seeder");
const AdminFactory = require("../factories/AdminFactory");
const UserFactory = require("../factories/UserFactory");
const PostFactory = require("../factories/PostFactory");

class DatabaseSeeder extends Seeder {
    
    async run(){
        let userData = await UserFactory.createBulk(20);
        let adminData = await AdminFactory.createBulk(20);
        let postsData = await PostFactory.createBulk(100);
    }
}

module.exports = DatabaseSeeder;