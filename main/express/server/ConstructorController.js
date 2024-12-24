class ConstructorController {
    initialize(req) {
        this.setFlash = (key, value) => {
            req.flash(key, value);
        }
        this.getFlash = (key) => {
            return req.flash(key)[0] || null;
        }
    }
}

module.exports = ConstructorController;