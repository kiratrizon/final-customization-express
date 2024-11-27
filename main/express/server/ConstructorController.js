class ConstructorController {
    init(request) {
        global.request = request;
        global.dd = (data) => dump(data, true);
    }

}

module.exports = ConstructorController;