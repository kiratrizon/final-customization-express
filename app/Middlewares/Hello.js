class Hello {

    static async handle(request, next) {
        // your middleware logic here
        if (!0) {
            // return view('login');
        }
        return next();
    }
}

module.exports = Hello;