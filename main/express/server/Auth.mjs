import GuardInitiator from "./GuardInitiator.mjs";


const defaultGuard = await config('auth.default.guard');
class Auth {

    static #defaultGuard;
    static attempt(credentials, remember = false) {
        return this.guard(this.#defaultGuard).attempt(credentials, remember);
    }

    static login(user, remember = false) {
        return this.guard(this.#defaultGuard).login(user, remember);
    }

    static loginUsingId(id, remember = false) {
        return this.guard(this.#defaultGuard).loginUsingId(id, remember);
    }

    static once(credentials) {
        return this.guard(this.#defaultGuard).once(credentials);
    }

    static onceUsingId(id) {
        return this.guard(this.#defaultGuard).onceUsingId(id);
    }

    static logout() {
        return this.guard(this.#defaultGuard).logout();
    }

    static check() {
        return this.guard(this.#defaultGuard).check();
    }

    static guest() {
        return this.guard(this.#defaultGuard).guest();
    }

    static id() {
        return this.guard(this.#defaultGuard).id();
    }

    static user() {
        return this.guard(this.#defaultGuard).user();
    }

    static validate(credentials) {
        return this.guard(this.#defaultGuard).validate(credentials);
    }

    static hasUser() {
        return this.guard(this.#defaultGuard).hasUser();
    }

    static setUser(user) {
        return this.guard(this.#defaultGuard).setUser(user);
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