const Controller = require("./Controller");

class WelcomeController extends Controller {

    welcome() {
        this.res.status(200).json({
            message: 'welcome'
        });
    }
    test(id) {

        this.res.json({ message: id });
    }
}

module.exports = WelcomeController;