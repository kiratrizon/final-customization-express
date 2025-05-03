import Controller from "../../main/base/Controller.mjs";
import Auth from "../../main/express/server/Auth.mjs";
import Admin from "../../models/Admin.mjs";
import User from "../../models/User.mjs";

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

    async admins(request) {
        const users = (await Admin.all()).map((user) => {
            return user.toArray();
        });
        return response().json({ users });
    }

    async getUser(request, id) {
        const user = await User.find(id);
        if (!user) {
            return response().json({ message: 'User not found' }, 404);
        }
        return response().json({ user: user.toArray() });
    }
}

export default UserController;