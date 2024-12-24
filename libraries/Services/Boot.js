class Boot {
    static use() {
        return [
            'session',
            'cors',
            'cookieParser',
            'flash',
            'helmet'
        ]
    }

    static 404() {
        if (isApiUrl()) {
            json({ message: "Not Found" }, 404);
        } else {
            dump({ message: "Not Found" });
        }
    }

    static hasher() {
        return 'bcryptjs';
    }
}

module.exports = Boot;