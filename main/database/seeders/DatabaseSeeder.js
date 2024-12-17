const Seeder = require("../../base/Seeder");
const UserFactory = require("../factories/UserFactory");

class DatabaseSeeder extends Seeder {
    
    async run(){
        let userData = await UserFactory.create(10);
        console.log(userData);
    }
}

module.exports = DatabaseSeeder;