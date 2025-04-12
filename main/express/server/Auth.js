const Carbon = require("../../../libraries/Materials/Carbon");
const DB = require("../../../libraries/Materials/DB");
const Hash = require("../../../libraries/Services/Hash");
const crypto = require('crypto');
const defaultGuard = config('auth.default.guard');
const guards = config('auth.guards');
const providers = config('auth.providers');

class Guard {
    #hidden = {};
    constructor(data, hidden) {
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
        this.#hidden = hidden;
    }

    makeVisible(key) {
        if (this.#hidden[key]) {
            this[key] = this.#hidden[key];
        }
    }
    makeHidden(key) {
        delete this[key];
    }
}
class Guarder {
    #guardDriver;
    #guardProvider;
    #jwtTable = config('jwt.oauth_db');
    constructor(guard) {
        if (!Object.keys(guards).includes(guard)) {
            throw new Error(`Guard ${guard} is not defined`);
        }
        this.#guardDriver = guards[guard].driver;
        this.#guardProvider = providers[guards[guard].provider];
        if (this.#guardProvider.driver === 'eloquent') {
            if (!this.#guardProvider.model) {
                throw new Error('Model is not defined');
            }
            if (!this.#guardProvider.model.authenticatableClass) {
                throw new Error(`Model ${this.#guardProvider.model.name} is not authenticatable. Please extend Authenticatable class`);
            }
        }
    }
    check() {
        const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
        if (this.#guardDriver === 'jwt') {
            const token = this.getBearerToken();
            if (!token) return false;
            if (!this.#verifyJwtSignature(token)) return false;
            const [, middleToken,] = token.split('.');
            const tokenDecoded = JSON.parse(base64_decode_safe(middleToken));
            if (tokenDecoded.exp < NOW()) return false;
            if (!tokenDecoded.id || tokenDecoded.user_type != user_type) return false;
            return true;
        } else if (this.#guardDriver === 'session') {
            const userEncoded = $_SESSION_AUTH[user_type];
            if (!!userEncoded) return true;
        }
        return false;
    }
    attempt(data) {
        if (this.#guardDriver === 'jwt') {
            return this.#tokenGenerator(data, this.#guardProvider.driver.toLowerCase());
        } else if (this.#guardDriver === 'session') {
            return this.#sessionGenerator(data, this.#guardProvider.driver.toLowerCase());
        }
        return false;
    }
    #tokenGenerator(...args) {
        const { data, type, selectedKey } = this.#validateData(...args);
        let user_type;
        let fetchedData;
        let fetcher;
        let hiddens = ['password'];
        if (type === 'eloquent') {
            user_type = this.#guardProvider.model.name;
            fetcher = this.#guardProvider.model;
            hiddens = new this.#guardProvider.model().hidden;
        } else if (type === 'database') {
            user_type = this.#guardProvider.table;
            fetcher = DB.table(user_type);
        }

        const eloquentFields = [`${user_type}.*`, `CASE WHEN OAT.token IS NOT NULL THEN OAT.token ELSE 0 END AS token`, `OAT.expires_at`, `OAT.is_revoked`, `OAT.id as token_id`];

        fetchedData = fetcher.select(...eloquentFields).leftJoin(`${this.#jwtTable} as OAT`, `${user_type}.id`, '=', 'OAT.user_id').where(`${user_type}.${selectedKey}`, data[selectedKey]).first();

        if (!fetchedData) return null;

        const passed = Hash.check(data.password, fetchedData.password);

        if (!passed) return null;

        const checkToken = fetchedData.token != 0 ? fetchedData.token : false;

        if (checkToken && fetchedData.expires_at > NOW() && fetchedData.is_revoked == 0) return checkToken;

        const now = NOW();

        const token = this.#jwtSigner(fetchedData, now, user_type);

        const inserted = DB.insert(`INSERT INTO ${this.#jwtTable} (token, user_id, user_type, expires_at, created_at, updated_at) VALUES (?,?,?,?,?,?)`, [token, fetchedData.id, user_type, config('jwt.expiration.default'), now, now]);

        if (inserted) return token;

        return false;
    }
    #sessionGenerator(...args) {
        const { data, type, selectedKey } = this.#validateData(...args);
        let user_type;
        let fetchedData;
        let fetcher;
        if (type === 'eloquent') {
            user_type = this.#guardProvider.model.name;
            fetcher = this.#guardProvider.model;
        } else if (type === 'database') {
            user_type = this.#guardProvider.table;
            fetcher = DB.table(user_type);
        }
        fetchedData = fetcher.where(selectedKey, data[selectedKey]).first();
        if (!fetchedData) return null;
        const passed = Hash.check(data.password, fetchedData.password);
        if (passed) {
            return this.#sessionSigner(fetchedData, user_type, type);
        }
        return false;
    }
    #validateData(...args) {
        const data = args[0];
        const type = args[1];
        const selectKey = Object.keys(data);
        if (selectKey.length !== 2) {
            throw new Error('Invalid attempt data needs to be an object with 2 keys identifier and password');
        }
        const selectedKey = selectKey[0] === 'password' ? selectKey[1] : selectKey[0];
        return { data, type, selectedKey };
    }
    user() {
        let user = null;
        let id = this.id();
        let user_type;
        let decoded;
        let hidden;
        if (id) {
            user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;

            if (this.#guardDriver === 'session') {
                const visibleData = $_SESSION_AUTH[user_type];
                const hiddenData = $_SESSION_HIDDEN[user_type];
                if (!!visibleData) {
                    decoded = JSON.parse(base64_decode_safe(visibleData));
                    hidden = JSON.parse(base64_decode_safe(hiddenData));
                    user = new Guard(decoded, hidden);
                }
            } else if (this.#guardDriver === 'jwt') {
                const isEloquent = this.#guardProvider.driver === 'eloquent';
                let fetchedUser = this.#userFromJwt(id, isEloquent);
                hidden = {};
                if (isEloquent) {
                    let getHidden = new this.#guardProvider.model().hidden;
                    getHidden.forEach((key) => {
                        hidden[key] = fetchedUser[key];
                        delete fetchedUser[key];
                    });
                }
                user = new Guard(fetchedUser, hidden);
            }
        }
        return user;
    }
    id() {
        let user = null;
        if (this.#guardDriver === 'jwt') {
            let token = this.getBearerToken();
            if (!token) return null;
            const [, middleToken,] = token.split('.');
            user = JSON.parse(base64_decode_safe(middleToken));
        } else if (this.#guardDriver === 'session') {
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
            const userEncoded = $_SESSION_AUTH[user_type];
            if (!userEncoded) return null;
            user = JSON.parse(base64_decode_safe(userEncoded));
        }
        if (user && user.id) {
            return user.id;
        }
        return null;
    }
    logout() {
        if (this.#guardDriver === 'jwt') {
            let token = this.getBearerToken();
            if (!token) return false;
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
            DB.statement(`UPDATE ${this.#jwtTable} SET is_revoked =? WHERE token =? AND user_type =?`, [1, token, user_type]);
            return true;
        } else if (this.#guardDriver === 'session') {
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
            delete $_SESSION_AUTH[user_type];
            delete $_SESSION_HIDDEN[user_type];
            return true;
        }
        return false;
    }
    #jwtSigner(payload, time, user_type) {
        const algo = config('jwt.algorithm');
        const secretKey = config('jwt.secret_key');
        const header = {
            alg: algo,
            typ: 'JWT'
        };

        const { id } = payload;
        const filteredPayload = { id };
        if (time) {
            filteredPayload.iat = time;
            filteredPayload.exp = Carbon.addMinutes(config('jwt.expiration.default') || 60 * 24 * 7).getDateTime();
        }
        filteredPayload.user_type = user_type;
        // Base64url encode header
        const base64UrlHeader = base64_encode_safe(JSON.stringify(header));

        // Base64url encode filteredPayload
        const base64UrlPayload = base64_encode_safe(JSON.stringify(filteredPayload));

        // Create the signature
        const data = `${base64UrlHeader}.${base64UrlPayload}`;
        const signature = crypto
            .createHmac(algo, secretKey)
            .update(data)
            .digest('base64url');

        // Return the JWT token
        return `${base64UrlHeader}.${base64UrlPayload}.${signature}`;
    }
    #sessionSigner(...args) {
        const { payload, user_type, type } = args;
        let hidden = ['password'];
        if (type === 'eloquent') {
            let instantiatedModel = new this.#guardProvider.model();
            hidden = instantiatedModel.hidden;
        }
        const hiddenData = {};
        hidden.forEach((key) => {
            hiddenData[key] = payload[key];
            delete payload[key];
        });
        $_SESSION_HIDDEN[user_type] = base64_encode_safe(JSON.stringify(hiddenData));
        $_SESSION_AUTH[user_type] = base64_encode_safe(JSON.stringify(payload));
        if ($_SESSION_AUTH[user_type]) {
            return true;
        }
        return false;
    }
    #verifyJwtSignature(token) {
        const [header, payload, signature] = token.split('.');
        const algo = config('jwt.algorithm');
        const secretKey = config('jwt.secret_key');
        const data = `${header}.${payload}`;
        const newSignature = crypto
            .createHmac(algo, secretKey)
            .update(data)
            .digest('base64url');
        return signature === newSignature;
    }

    getBearerToken() {
        const headerToken = request.header('authorization');
        if (!headerToken) {
            return false;
        }
        const [headerName, token] = headerToken.split(' ');
        if (headerName !== 'Bearer') {
            return false;
        }
        return token;
    }

    #userFromJwt(id, isEloquent) {
        if (!id) return null;
        if (isEloquent) {
            return this.#guardProvider.model.find(id);
        } else {
            return DB.table(this.#guardProvider.table).where('id', id).first();
        }
    }
}

class Auth {
    static #storeData = {

    };
    static guard(guard) {
        return new Guarder(guard);
    }
    static check() {
        return new Guarder(defaultGuard).check();
    }
    static attempt(data) {
        return new Guarder(defaultGuard).attempt(data);
    }
    static user() {
        return new Guarder(defaultGuard).user();
    }
    static id() {
        return new Guarder(defaultGuard).id();
    }
    static logout() {
        return new Guarder(defaultGuard).logout();
    }
}
module.exports = Auth;
