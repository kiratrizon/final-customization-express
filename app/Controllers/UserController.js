const Validator = require("../../libraries/Services/Validator");
const User = require("../../models/User");
const Controller = require("../../main/base/Controller");
const Auth = require("../../main/express/server/Auth");
class UserController extends Controller {
    index(request) {
        dd(request);
        return view('index');
    }

    create() {
        jsonResponse({ message: "UserController create" })
    }

    store() {
        let validate = Validator.make($_POST, {
            name: "required",
            email: "required|email|unique:users",
            password: "required|min:6|confirmed"
        });
        if (validate.fails()) {
            return jsonResponse({ errors: validate.errors }, 400);
        }
        const user = User.create($_POST);
        return jsonResponse({ user }, user ? 201 : 403);
    }

    store2() {
        const validate = Validator.make($_POST, {
            name: "required",
            email: "required|email|unique:users",
            password: "required|min:6|confirmed"
        });
        if (validate.fails()) {
            return redirect(...DEFAULT_BACK);
        }
        const user = User.create($_POST);
        if (!user) {
            return redirect(...DEFAULT_BACK);
        }
        return redirect(route('signin'));
    }

    show(id) {
        jsonResponse(ORIGINAL_URL);
    }

    edit(id) {
        jsonResponse($_GET)
    }

    update(id) {
        jsonResponse({ message: "UserController update" })
    }

    destroy(id) {
        jsonResponse({ message: "UserController destroy" })
    }

    login() {
        let validate = Validator.make($_POST, {
            email: "required|email",
            password: "required"
        });
        if (validate.fails()) {
            return redirect(...DEFAULT_BACK);
        }
        if (!Auth.guard('user').attempt($_POST)) {
            return redirect(...DEFAULT_BACK);
        }
        redirect(route('user.dashboard'));
    }

    getUser() {
        const user = Auth.user();
        jsonResponse({ user });
    }

    sessionUser() {
        jsonResponse($_REQUEST);
    }
}

module.exports = UserController;