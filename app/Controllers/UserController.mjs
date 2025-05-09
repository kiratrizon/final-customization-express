import Controller from "../../main/base/Controller.mjs";
import User from "../../models/User.mjs";


class UserController extends Controller {
    // Create methods here 

    /**
     * @param {import('../../main/express/http/ExpressRequest').default} request
     */
    async index(request) {
        const credentials = await request.validate({
            email: 'required|email',
            password: 'required|min:6',
        });
    }

    /**
     * @param {import('../../main/express/http/ExpressRequest').default} request
     */
    async users(request) {
        const users = await User.all();
        return response().json({ users: users.map(user => user.toArray()) });
    }
}

export default UserController;