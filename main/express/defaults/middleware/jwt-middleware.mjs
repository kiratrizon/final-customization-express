class JWTMiddleware {

    guard;
    constructor(guard) {
        this.guard = guard;
    }
    /**
     * @param {import('../../http/ExpressRequest').default} request
     */
    async handle(request, next) {
        request.auth().shouldUse(this.guard);
        if (!request.auth().check() && !(await request.auth().user())) {
            return response().json({ message: 'Unauthorized' }, 401);
        }

        return next(request);

    }
}

export default JWTMiddleware;