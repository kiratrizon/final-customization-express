const BaseController = require("../../main/express/server/BaseController");
class Controller extends BaseController {
    constructor(){
        super();
    }
    test(){
        return "Hello World";
    }
}

module.exports = Controller;