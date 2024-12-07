const Validator = require("../../libraries/Services/Validator");
const Controller = require("../../main/base/Controller");

class AdminController extends Controller {
    constructor() {
        super();
        super.loadModel([
            'Admin'
        ]);
    }
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
        const admin = await AdminController.Admin.create(POST);
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
}

module.exports = AdminController;