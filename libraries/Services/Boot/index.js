class Boot {
    static notFound() {
        if (isRequest()) {
            return response().json({ error: 'Not Found' }, 404);
        }
        return view('error');
    }

    static hasher() {
        return 'bcrypt';
    }

}

module.exports = Boot;