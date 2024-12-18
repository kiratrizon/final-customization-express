const Carbon = require("../../../libraries/Materials/Carbon");
const DB = require("../../../libraries/Materials/DB");
const Hash = require("../../../libraries/Services/Hash");
const crypto = require('crypto');
const defaultGuard = config('auth.default.guard');
const guards = config('auth.guards');
const providers = config('auth.providers');

class Guard {
    constructor(data) {
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
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
    async check() {
        if (this.#guardDriver === 'jwt') {
            const token = this.getBearerToken();
            if (!token) return false;
            if (!this.#verifyJwtSignature(token)) return false;
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
            const data = await DB.select(`SELECT * FROM ${this.#jwtTable} WHERE token = ? and user_type = ? and is_revoked = ? and expires_at > ?`, [token, user_type, 0, Carbon.getDateTime()]);
            if (data.length) {
                return true;
            }
        } else if (this.#guardDriver === 'session') {
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
            const userEncoded = SESSION_AUTH[user_type];
            if (!!userEncoded) return true;
        }
        return false;
    }
    async attempt(data) {
        if (this.#guardDriver === 'jwt') {
            return await this.#tokenGenerator(data, this.#guardProvider.driver.toLowerCase());
        } else if (this.#guardDriver === 'session') {
            return await this.#sessionGenerator(data, this.#guardProvider.driver.toLowerCase());
        }
        return false;
    }
    async #tokenGenerator(...args) {
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

        const eloquentFields = [`${user_type}.*`, `CASE WHEN OAT.token IS NOT NULL THEN OAT.token ELSE 0 END AS token`, `OAT.expires_at`, `OAT.is_revoked`, `OAT.id as token_id`];

        fetchedData = await fetcher.select(...eloquentFields).leftJoin(`${this.#jwtTable} as OAT`, `${user_type}.id`, '=', 'OAT.user_id').where(`${user_type}.${selectedKey}`, data[selectedKey]).first();

        if (!fetchedData) return null;

        const passed = await Hash.check(data.password, fetchedData.password);

        if (!passed) return null;

        const checkToken = fetchedData.token != 0 ? fetchedData.token : false;

        if (checkToken && fetchedData.expires_at > Carbon.getDateTime() && fetchedData.is_revoked == 0) return checkToken;

        const now = Carbon.getDateTime();

        const token = this.#jwtSigner(fetchedData, now, user_type);

        const inserted = await DB.insert(`INSERT INTO ${this.#jwtTable} (token, user_id, user_type, expires_at, created_at, updated_at) VALUES (?,?,?,?,?,?)`, [token, fetchedData.id, user_type, config('jwt.expiration.default'), now, now]);

        if (inserted) return token;

        return false;
    }
    async #sessionGenerator(...args) {
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
        fetchedData = await fetcher.where(selectedKey, data[selectedKey]).first();
        if (!fetchedData) return null;
        const passed = await Hash.check(data.password, fetchedData.password);
        if (passed) {
            return this.#sessionSigner(fetchedData, user_type);
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
    async user() {
        let user = null;
        let dataFetched = {};
        let id = this.id();
        if (id) {
            if (this.#guardProvider.driver === 'eloquent') {
                const useModel = new this.#guardProvider.model();
                const hidden = useModel.hidden;
                delete useModel.hidden;
                delete useModel.timestamp;
                delete useModel.fillable;
                delete useModel.guarded;
                dataFetched = await this.#guardProvider.model.find(id);
                if (!dataFetched) return null;
            } else if (this.#guardProvider.driver === 'database') {
                [dataFetched] = await DB.select(`SELECT * FROM ${this.#guardProvider.table} WHERE id =? LIMIT 1`, [id]);
            }
        }
        if (dataFetched) {
            user = new Guard(dataFetched);
        }
        return user;
    }
    id() {
        let user = null;
        if (this.#guardDriver === 'jwt') {
            let token = this.getBearerToken();
            if (!token) return null;
            const [, middleToken,] = token.split('.');
            user = JSON.parse(base64_decode(middleToken));
        } else if (this.#guardDriver === 'session') {
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
            const userEncoded = SESSION_AUTH[user_type];
            if (!userEncoded) return null;
            user = JSON.parse(base64_decode(userEncoded));
        }
        if (user && user.id) {
            return user.id;
        }
        return null;
    }
    async logout() {
        if (this.#guardDriver === 'jwt') {
            let token = this.getBearerToken();
            if (!token) return false;
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
            const revoked = await DB.update(`UPDATE ${this.#jwtTable} SET is_revoked =? WHERE token =? AND user_type =?`, [1, token, user_type]);
            if (revoked) {
                return true;
            }
        } else if (this.#guardDriver === 'session') {
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.table;
            delete SESSION_AUTH[user_type];
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

        const { id, email, username, name } = payload;
        const filteredPayload = { id };

        if (email) {
            filteredPayload.email = email;
        }
        if (username) {
            filteredPayload.username = username;
        }
        if (name) {
            filteredPayload.name = name;
        }
        if (time) {
            filteredPayload.iat = time;
            filteredPayload.exp = config('jwt.expiration.default');
        }
        filteredPayload.user_type = user_type;
        // Base64url encode header
        const base64UrlHeader = base64_encode(JSON.stringify(header));

        // Base64url encode filteredPayload
        const base64UrlPayload = base64_encode(JSON.stringify(filteredPayload));

        // Create the signature
        const data = `${base64UrlHeader}.${base64UrlPayload}`;
        const signature = crypto
            .createHmac(algo, secretKey)
            .update(data)
            .digest('base64url');

        // Return the JWT token
        return `${base64UrlHeader}.${base64UrlPayload}.${signature}`;
    }
    #sessionSigner(payload, user_type) {
        const { id, email, username, name } = payload;
        const filteredPayload = { id };

        if (email) {
            filteredPayload.email = email;
        }
        if (username) {
            filteredPayload.username = username;
        }
        if (name) {
            filteredPayload.name = name;
        }
        SESSION_AUTH[user_type] = base64_encode(filteredPayload);
        if (SESSION_AUTH[user_type]) {
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
        const headerToken = REQUEST.headers['authorization'];
        if (!headerToken) {
            return false;
        }
        const [headerName, token] = headerToken.split(' ');
        if (headerName !== 'Bearer') {
            return false;
        }
        return token;
    }
}

class Auth {
    static guard(guard) {
        return new Guarder(guard);
    }
    static check() {
        return new Guarder(defaultGuard).check();
    }
    static async attempt(data) {
        return await new Guarder(defaultGuard).attempt(data);
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
