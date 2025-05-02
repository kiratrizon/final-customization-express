const Auth = require("../../server/Auth");

class JWTMiddleware {

    guard;
    constructor(guard) {
        console.log('JWTMiddleware guard:', guard);
        this.guard = guard;
    }
    async handle(request, next) {
        console.log(this.guard);
        if (!Auth.guard(this.guard).check() && !(await Auth.guard(this.guard).user())) {
            return response().json({ message: 'Unauthorized' }, 401);
        }

        return next(request);

    }
}

module.exports = JWTMiddleware;