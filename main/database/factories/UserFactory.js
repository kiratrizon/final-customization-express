const Factory = require("../../base/Factory");
const Hash = require("../../../libraries/Services/Hash");
const User = require("../../../models/User");

class UserFactory extends Factory {

    model = User;
    
    async definition() {
        return {
            name: this.faker.person.fullName(),
            email: this.faker.internet.email(),
            password: await Hash.make('admin123'),
        };
    }
}

module.exports = UserFactory;