const Validator = require("../../libraries/Services/Validator");
const User = require("../../models/User");
const Controller = require("../../main/base/Controller");
const Hash = require("../../libraries/Services/Hash");
const Auth = require("../../main/express/server/Auth");

class UserController extends Controller {
    async index() {
        const user = await User.find(1);
        console.log(user);
        user.name = "Eirazen";
        user.email = "tgenesistroy@gmail.com";
        user.password = await Hash.make('asterda23');
        user.save();
        json_response({ users: await User.find(1) });
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

    async login(){
        let validate = await Validator.make(post, {
            email: "required|email",
            password: "required"
        });
        if (validate.fails()){
            return json_response({ errors: validate.errors }, 400);
        }
        const token = await Auth.attempt(post);
        if (!token){
            return json_response({ message: "Token not generated" }, 401);
        }
        json_response({ token }, 200);
    }

    getUser(){
        json_response({ user: Auth.user() });
    }
}

module.exports = UserController;