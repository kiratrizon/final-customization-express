const Validator = require("../../libraries/Services/Validator");
const User = require("../../models/User");
const Controller = require("../../main/base/Controller");
const Auth = require("../../main/express/server/Auth");
class UserController extends Controller {
    index() {

        dd(request);
    }
}

module.exports = UserController;