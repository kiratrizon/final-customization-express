import Factory from "../../base/Factory.mjs";
import Hash from "../../../libraries/Services/Hash.mjs";
import User from "../../../models/User.mjs";


class UserFactory extends Factory {

    model = User;

    definition() {
        return {
            name: this.faker.person.fullName(),
            email: this.faker.internet.email(),
            password: Hash.make('admin123'),
        };
    }
}

export default UserFactory;