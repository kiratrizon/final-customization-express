const Validator = require("../../libraries/Services/Validator");
const User = require("../../models/User");
const Controller = require("../../main/base/Controller");
const Hash = require("../../libraries/Services/Hash");

class UserController extends Controller {
    async index() {
        const user = new User();
        user.name = "Throy";
        user.email = "tgenesistroy@gmail.com";
        user.password = await Hash.make('asterda23');
        user.save();
        json_response({ users: await User.find(2) });
    }
    static testFunction() {
        json_response("Hello World");
    }
    async create() {
        json_response({ message: "UserController create" })
    }

    async store() {
        let validate = await Validator.make(post, {
            name: "required",
            email: "required|email|unique:users",
            password: "required|min:6|confirmed"
        });
        if (validate.fails()) {
            return json_response({ errors: validate.errors }, 400);
        }
        const user = await User.create(post);
        return json_response({ user }, user ? 201 : 403);
    }

    async show(id) {
        const user = await User.find(id);
        json_response({ user });
    }

    async edit(id) {
        json_response({ get })
    }

    async update(id) {
        json_response({ message: "UserController update" })
    }

    async destroy(id) {
        json_response({ message: "UserController destroy" })
    }
}

module.exports = UserController;