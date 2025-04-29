const Controller = require("../../main/base/Controller");
const DB = require("../../main/database/Manager/DB");
const Auth = require("../../main/express/server/Auth");
const User = require("../../models/User");
class UserController extends Controller {
    async index(request, id) {
        const email = 'Grant.Torp69@hotmail.com';
        const password = 'admin123';
        let token = await Auth.attempt({ email, password });

        return response().json({ token });
    }

    async show(request, id) {
        const user = await User.where('id', id).first();
        if (user) {
            return response().json(user);
        } else {
            return response().json({ message: 'User not found' }, 404);
        }
    }
}

module.exports = UserController;