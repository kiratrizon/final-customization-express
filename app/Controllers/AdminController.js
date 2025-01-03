const Validator = require("../../libraries/Services/Validator");
const Controller = require("../../main/base/Controller");
const Auth = require("../../main/express/server/Auth");
const Admin = require("../../models/Admin");

class AdminController extends Controller {

    // get
    index() {
        jsonResponse(route('user.index'));
    }
    // get
    create() {
        jsonResponse({ message: "AdminController create" })
    }
    // post
    store() {
        const validate = Validator.make(POST, {
            name: "required",
            email: "required|email|unique:admins",
            password: "required|min:6|confirmed"
        });

        if (validate.fails()) {
            return jsonResponse({ errors: validate.errors }, 400);
        }
        const admin = Admin.create(POST);
        return jsonResponse({ admin });
    }
    // get
    show(id) {
        jsonResponse({ message: "AdminController show" })
    }
    // get
    edit(id) {
        jsonResponse({ get })
    }
    // put
    update(id) {
        jsonResponse({ message: "AdminController update" })
    }
    // delete
    destroy(id) {
        jsonResponse({ message: "AdminController destroy" })
    }
    login() {
        const validate = Validator.make(POST, {
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
        const token = Auth.guard('jwt_admin').attempt(data);
        return jsonResponse({ token });
    }
}

module.exports = AdminController;