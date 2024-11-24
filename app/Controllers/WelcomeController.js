const Controller = require("./Controller");

class WelcomeController extends Controller {

    welcome() {
        dd(request);
    }
    test(id, content) {
        console.log(config('auth'))
        dd({ id, content, request });
    }
}

module.exports = WelcomeController;