class Hello {

    static handle(req, res, next) {

        console.log('Hello');
        // next();
    }
}

module.exports = Hello;