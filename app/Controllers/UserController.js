const Controller = require("../../main/base/Controller");
const Admin = require("../../models/Admin");
class UserController extends Controller {
    async index() {

        let admins = this.dataExtract();
        // admins = Admin.all();
        return response().json({ admins });
    }

    dataExtract() {
        return []
    }
}

module.exports = UserController;