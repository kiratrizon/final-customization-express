class Test {

    static handle(req, res, next) {

        console.log('hello test middleware');
        next();
    }
}

module.exports = Test;