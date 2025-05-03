import Auth from "../../server/Auth.mjs";


class JWTMiddleware {

    guard;
    constructor(guard) {
        this.guard = guard;
    }
    async handle(request, next) {
        Auth.shouldUse(this.guard);
        if (!Auth.check() && !(await Auth.user())) {
            return response().json({ message: 'Unauthorized' }, 401);
        }

        return next(request);

    }
}

export default JWTMiddleware;