const Validator = require("../../libraries/Services/Validator");
const Controller = require("../../main/base/Controller");
const Auth = require("../../main/express/server/Auth");
const Admin = require("../../models/Admin");

class AdminController extends Controller {

    // get
    async index() {
        jsonResponse(route('user.index'));
    }
    // get
    async create() {
        jsonResponse({ message: "AdminController create" })
    }
    // post
    async store() {
        const validate = await Validator.make(POST, {
            name: "required",
            email: "required|email|unique:admins",
            password: "required|min:6|confirmed"
        });

        if (validate.fails()) {
            return jsonResponse({ errors: validate.errors }, 400);
        }
        const admin = await Admin.create(POST);
        return jsonResponse({ admin });
    }
    // get
    async show(id) {
        jsonResponse({ message: "AdminController show" })
    }
    // get
    async edit(id) {
        jsonResponse({ get })
    }
    // put
    async update(id) {
        jsonResponse({ message: "AdminController update" })
    }
    // delete
    async destroy(id) {
        jsonResponse({ message: "AdminController destroy" })
    }
    async login() {
        const validate = await Validator.make(POST, {
            email: "required|email",
            password: "required"
        });
        if (validate.fails()) {
            return jsonResponse({ errors: validate.errors }, 400);
        }
        const data = {
            email: POST.email,
            password: POST.password
        }
        const token = await Auth.guard('jwt_admin').attempt(data);
        return jsonResponse({ token });
    }
}

module.exports = AdminController;