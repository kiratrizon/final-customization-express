const Validator = require("../../libraries/Services/Validator");
const Controller = require("../../main/base/Controller");
const DB = require("../../main/database/Manager/DB");
const Auth = require("../../main/express/server/Auth");
const User = require("../../models/User");
class UserController extends Controller {
    async index(request) {
        const user = await Auth.user();
        // console.log(user.toArray());
        return response().json({ user: user.toArray() });

    }

    async login(request) {
        const credentials = await request.validate({
            'email': 'required|email',
            'password': 'required'
        });

        let token;
        if (!(token = await Auth.attempt(credentials))) {
            return response().json({ message: 'Invalid credentials' }, 401);
        }

        return response().json({
            message: 'Login successful',
            token: token
        });
    }

    async users(request) {
        const users = (await User.all()).map((user) => {
            return user.toArray();
        });
        return response().json({ users });
    }
}

module.exports = UserController;