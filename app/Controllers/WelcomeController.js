const Controller = require("./Controller");

class WelcomeController extends Controller {

    welcome() {
        dd(request);
    }
    test(id, content) {
        dd({ id, content, request });
    }
}

module.exports = WelcomeController;