const Controller = require("./Controller");

class HelloController extends Controller {
    constructor(){
        super();
        this.loadModel([
            // Load model here strings
        ]);
    }
}

module.exports = HelloController;