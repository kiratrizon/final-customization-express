const Controller = require("./Controller");

class WelcomeController extends Controller {
    constructor(){
        super();
        this.loadModel([
            'Admin'
        ]);
    }
    async welcome() {
        let data = await this.Admin.update(2, {
            username: 'kiratrizons',
            email: 'example@example.com',
        });

        json({data});
    };
    test(id, content) {
        dd({ id, content, request });
    }

    index(){
        json({message: 'Welcome to the index page!'});
    }
}

module.exports = WelcomeController;