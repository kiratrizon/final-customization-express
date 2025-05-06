class ExpressRedirect {
    statusCode = 302;
    url = null;
    back = null;
    route = null;
    constructor(url = null) {
        if (url && typeof url === 'string') {
            this.url = url;
        }
    }
    setStatusCode(code) {
        this.statusCode = code;
        return this;
    }
}

export default ExpressRedirect;