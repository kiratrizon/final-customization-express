class Test {

    static handle(req, res, next) {

        console.log(base_path());
        next();
    }
}

module.exports = Test;