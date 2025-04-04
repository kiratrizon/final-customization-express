class Boot {
    static use() {
        return [
            
        ];
    }

    static 404() {
        if (isApiUrl()) {
            jsonResponse({ message: "Not Found" }, 404);
        } else {
            dump({ message: "Not Found" });
        }
    }

    static hasher() {
        return 'bcrypt';
    }
}

module.exports = Boot;