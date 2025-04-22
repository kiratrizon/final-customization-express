class Hello {

    static async handle(next) {
        // your middleware logic here
        if (true) {
            return view('login');
        }
        return next();
    }
}

module.exports = Hello;