const Factory = require("../../base/Factory");
const Hash = require("../../../libraries/Services/Hash");
const Admin = require("../../../models/Admin");

class AdminFactory extends Factory {

    model = Admin;
    
    async definition() {
        return {
            name: this.faker.person.fullName(),
            email: this.faker.internet.email(),
            password: await Hash.make('admin123'),
        };
    }
}

module.exports = AdminFactory;