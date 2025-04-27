const Controller = require("../../main/base/Controller");
const DB = require("../../main/database/Manager/DB");
const User = require("../../models/User");
class UserController extends Controller {
    async index(request, id) {
        const user = { id };
        dd(id);
        return response()
            .json({ user });
    }
}

module.exports = UserController;