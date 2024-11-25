class BaseController {
    #req;
    #res;
    init(request) {
        if (global.request === undefined) {
            global.request = request;
        }
        if (global.response === undefined) {
            global.response = () => res;
        }
    }
}

module.exports = BaseController;
