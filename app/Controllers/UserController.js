const Controller = require("../../main/base/Controller");
const DB = require("../../main/database/Manager/DB");
const User = require("../../models/User");
class UserController extends Controller {
    async index(request, id) {
        const user = await User.query()
            .where('id', id)
            .first();

        return response()
            .json({ user });
    }
}

module.exports = UserController;