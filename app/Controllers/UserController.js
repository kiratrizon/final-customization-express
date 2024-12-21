const Validator = require("../../libraries/Services/Validator");
const User = require("../../models/User");
const Controller = require("../../main/base/Controller");
const Auth = require("../../main/express/server/Auth");
const Hash = require("../../libraries/Services/Hash");
const DB = require("../../libraries/Materials/DB");
const Post = require("../../models/Post");
const Escaper = require("../../libraries/Materials/Escaper");

class UserController extends Controller {
    async index() {
        // const selectFields = [
        //     'Post.title',
        //     '(CASE WHEN Post.type = 1 THEN Admin.name ELSE User.name END) AS author',
        //     'Post.created_at',
        // ];
        // const data = await Post.select(...selectFields)
        //     .leftJoin('admins as Admin', 'Post.user_id', '=', 'Admin.id')
        //     .leftJoin('users as User', 'Post.user_id', '=', 'User.id')
        //     .get();
        // jsonResponse({ data });
        // create a user
        const userData = {
            name: "Thro'y",
            email: "throy@example.com",
            password: await Hash.make("asterda23"),
        }
        console.log(Escaper.resolve(userData.name));
        jsonResponse({ user: await User.find(2) });
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

    async login() {
        let validate = await Validator.make(POST, {
            email: "required|email",
            password: "required"
        });
        if (validate.fails()) {
            return jsonResponse({ errors: validate.errors }, 400);
        }
        const logged = await Auth.attempt(POST);
        if (!logged) {
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