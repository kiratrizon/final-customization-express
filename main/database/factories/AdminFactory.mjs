import Factory from "../../base/Factory.mjs";
import Hash from "../../../libraries/Services/Hash.mjs";
import Admin from "../../../models/Admin.mjs";


class AdminFactory extends Factory {

    model = Admin;

    definition() {
        return {
            name: this.faker.person.fullName(),
            email: this.faker.internet.email(),
            password: Hash.make('admin123'),
        };
    }
}

export default AdminFactory;