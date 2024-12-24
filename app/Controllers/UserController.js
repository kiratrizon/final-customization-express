const Validator = require("../../libraries/Services/Validator");
const User = require("../../models/User");
const Controller = require("../../main/base/Controller");
const Auth = require("../../main/express/server/Auth");
const Hash = require("../../libraries/Services/Hash");
const DB = require("../../libraries/Materials/DB");
const Post = require("../../models/Post");
const Escaper = require("../../libraries/Materials/Escaper");
const Carbon = require("../../libraries/Materials/Carbon");
const helloWorld = () => {
    return "Hello World";
}
class UserController extends Controller {
    async index() {
        // log($_POST, 'debug', 'test');
        jsonResponse(true);
    }
    static testFunction() {
        jsonResponse("Hello World");
    }
    async create() {
        jsonResponse({ message: "UserController create" })
    }

    async store() {
        let validate = await Validator.make($_POST, {
            name: "required",
            email: "required|email|unique:users",
            password: "required|min:6|confirmed"
        });
        if (validate.fails()) {
            return jsonResponse({ errors: validate.errors }, 400);
        }
        const user = await User.create($_POST);
        return jsonResponse({ user }, user ? 201 : 403);
    }

    async show(id) {
        jsonResponse(ORIGINAL_URL);
    }

    async edit(id) {
        jsonResponse(GET)
    }

    async update(id) {
        jsonResponse({ message: "UserController update" })
    }

    async destroy(id) {
        jsonResponse({ message: "UserController destroy" })
    }

    async login() {
        let validate = await Validator.make($_POST, {
            email: "required|email",
            password: "required"
        });
        if (validate.fails()) {
            return jsonResponse({ errors: validate.errors }, 400);
        }
        if ((await Auth.attempt($_POST))) {
            return back();
        }
        redirect('/');
    }

    async getUser() {
        const user = await Auth.user();
        jsonResponse({ user });
    }

    async sessionUser() {
        jsonResponse(REQUEST);
    }
}

module.exports = UserController;