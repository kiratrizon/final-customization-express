const Validator = require("../../libraries/Services/Validator");
const User = require("../../models/User");
const Controller = require("../../main/base/Controller");
const Hash = require("../../libraries/Services/Hash");
const Auth = require("../../main/express/server/Auth");

class UserController extends Controller {
    async index() {
        jsonResponse({REQUEST});
    }
    static testFunction() {
        jsonResponse("Hello World");
    }
    async create() {
        jsonResponse({ message: "UserController create" })
    }

    async store() {
        let validate = await Validator.make(POST, {
            name: "required",
            email: "required|email|unique:users",
            password: "required|min:6|confirmed"
        });
        if (validate.fails()) {
            return jsonResponse({ errors: validate.errors }, 400);
        }
        const user = await User.create(POST);
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

    async login(){
        let validate = await Validator.make(POST, {
            email: "required|email",
            password: "required"
        });
        if (validate.fails()){
            return jsonResponse({ errors: validate.errors }, 400);
        }
        const token = await Auth.attempt(POST);
        if (!token){
            return jsonResponse({ message: "Token not generated" }, 401);
        }
        jsonResponse({ token });
    }

    async getUser(){
        const user = await Auth.user();
        console.log(user);
        jsonResponse({ user });
    }

    async sessionUser(){
        jsonResponse(REQUEST);
    }
}

module.exports = UserController;