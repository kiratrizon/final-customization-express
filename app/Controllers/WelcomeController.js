const Controller = require("./Controller");

class WelcomeController extends Controller {
    constructor(){
        super();
        this.loadModel([
            'Admin'
        ]);
    }
    async welcome() {
        let data = await this.Admin.find(1);
        response(403).json({data});
    };
    test(id, content) {
        dd({ id, content, request });
    }
}

module.exports = WelcomeController;