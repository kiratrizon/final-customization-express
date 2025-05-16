class JWTMiddleware {

    guard;
    constructor(guard) {
        this.guard = guard;
    }
    /**
     * @param {import('../../http/ExpressRequest').default} request
     * @param  {InstanceType<typeof import('../../http/ExpressClosure').default>['next']} next
     */
    async handle(request, next) {
        if (!request.auth().check() && !(await request.auth().guard(this.guard).user())) {
            return response().json({ message: 'Unauthorized' }, 401);
        }

        return next(request);
    }
}

export default JWTMiddleware;