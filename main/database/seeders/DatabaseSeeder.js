const Seeder = require("../../base/Seeder");
const UserFactory = require("../factories/UserFactory");

class DatabaseSeeder extends Seeder {
    
    async run(){
        let userData = await UserFactory.create();
        userData.forEach((user)=>{
            const id = user.id;
            console.log(`${user.getProtected('password')}`);
        });
    }
}

module.exports = DatabaseSeeder;