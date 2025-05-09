import GuardInitiator from "./GuardInitiator.mjs";


const defaultGuard = await config('auth.default.guard');
class Auth {

    #defaultGuard = defaultGuard;
    #header;

    /**
     * @param {import('../../express/http/ExpressRequest').default} request
     */
    constructor(request) {
        this.#header = request.header();
    }

    attempt(credentials, remember = false) {
        return this.guard(this.#defaultGuard).attempt(credentials, remember);
    }

    logout() {
        return this.guard(this.#defaultGuard).logout();
    }

    check() {
        return this.guard(this.#defaultGuard).check();
    }

    id() {
        return this.guard(this.#defaultGuard).id();
    }

    user() {
        return this.guard(this.#defaultGuard).user();
    }

    shouldUse(guardName) {
        this.#defaultGuard = guardName;
    }

    guard(name = this.#defaultGuard) {
        if (empty(name)) {
            throw new Error('Guard name is empty');
        }
        const guard = new GuardInitiator(name);
        return guard.init(this.#header);
    }
}

export default Auth;