import Validator from "../../libraries/Services/Validator.mjs";
import Controller from "../../main/base/Controller.mjs";
import Auth from "../../main/express/server/Auth.mjs";
import Admin from "../../models/Admin.mjs";


class AdminController extends Controller {
    async index(request) {
        const admin = await Auth.user();
        return response().json({ admin: admin.toArray() });

    }

    async login(request) {
        const credentials = await request.validate({
            'email': 'required|email',
            'password': 'required'
        });

        let token;
        if (!(token = await Auth.guard('jwt_admin').attempt(credentials))) {
            return response().json({ message: 'Invalid credentials' }, 401);
        }

        return response().json({
            message: 'Login successful',
            token: token
        });
    }

    async users(request) {
        const users = (await Admin.all()).map((user) => {
            return user.toArray();
        });
        return response().json({ users });
    }

    async admins(request) {
        const admins = (await Admin.all()).map((user) => {
            return user.toArray();
        });
        return response().json({ admins });
    }

    async getAdmin(request, id) {
        const admin = await Admin.find(id);
        if (!admin) {
            return response().json({ message: 'Admin not found' }, 404);
        }
        return response().json({ admin: admin.toArray() });
    }
}

export default AdminController;