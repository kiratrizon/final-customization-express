import GuardInitiator from "./GuardInitiator.mjs";


const defaultGuard = await config('auth.default.guard');
class Auth {

    static #defaultGuard;
    static attempt(credentials, remember = false) {
        return this.guard(this.#defaultGuard).attempt(credentials, remember);
    }

    static logout() {
        return this.guard(this.#defaultGuard).logout();
    }

    static check() {
        return this.guard(this.#defaultGuard).check();
    }

    static id() {
        return this.guard(this.#defaultGuard).id();
    }

    static user() {
        return this.guard(this.#defaultGuard).user();
    }

    static shouldUse(guardName) {
        this.#defaultGuard = guardName;
    }

    static guard(name = Auth.#defaultGuard) {
        if (empty(name)) {
            throw new Error('Guard name is empty');
        }
        const guard = new GuardInitiator(name);
        return guard.init();
    }
}

// Set the default guard
Auth.shouldUse(defaultGuard);

export default Auth;