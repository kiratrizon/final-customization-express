class Hello {

    static handle(next) {
        // your middleware logic here
        if (true) {
            return view('login');
        }
        next();
    }
}

module.exports = Hello;