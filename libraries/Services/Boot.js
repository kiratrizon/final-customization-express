class Boot {
    static notFound() {
        if (isApiUrl()) {
            return response().json({ error: 'Not Found' }, 404);
        }
        return view('error');
    }

    static hasher() {
        return 'bcrypt';
    }

}

module.exports = Boot;