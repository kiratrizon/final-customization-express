const BaseController = require("../express/server/BaseController");
class Controller extends BaseController {
    test3() {
        return 'test3';
    }
}

module.exports = Controller;