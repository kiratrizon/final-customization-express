const Controller = require("../../main/base/Controller");

class UserDashboard extends Controller {
    // get
    index(){
        jsonResponse(route('user.index'));
    }
}

module.exports = UserDashboard;