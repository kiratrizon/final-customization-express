const BaseController = require("../../main/express/server/BaseController");
class Controller extends BaseController {
    test(){
        return "Hello World";
    }
}

module.exports = Controller;