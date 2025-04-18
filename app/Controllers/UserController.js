const Controller = require("../../main/base/Controller");
const Admin = require("../../models/Admin");
class UserController extends Controller {
    index() {
        
        let admins = [];
        admins = Admin.all();
        return response().json({admins});
    }
}

module.exports = UserController;