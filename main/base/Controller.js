const BaseController = require("../express/server/BaseController");
class Controller extends BaseController {
    test() {
        return "Hello World";
    }
}

module.exports = Controller;