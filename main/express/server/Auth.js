const Carbon = require("../../../libraries/Materials/Carbon");
const RawSqlExecutor = require("../../../libraries/Materials/RawSqlExecutor");
const Hash = require("../../../libraries/Services/Hash");
const crypto = require('crypto');
const defaultGuard = config('auth.default.guard');
const guards = config('auth.guards');
const providers = config('auth.providers');
class Guarder {
    #guardDriver;
    #guardProvider;
    #jwtTable = config('jwt.oauth_db');
    constructor(guard){
        if (!Object.keys(guards).includes(guard)){
            throw new Error(`Guard ${guard} is not defined`);
        }
        this.#guardDriver = guards[guard].driver;
        this.#guardProvider = providers[guards[guard].provider];
        if (this.#guardProvider.driver === 'eloquent'){
            if (!this.#guardProvider.model){
                throw new Error('Model is not defined');
            }
            if (!this.#guardProvider.model.authenticatableClass){
                throw new Error(`Model ${this.#guardProvider.model.name} is not authenticatable. Please extend Authenticatable class`);
            }
        }
    }
    async check(){
        if (this.#guardDriver === 'jwt'){
            const token = this.getBearerToken();
            if (!token) return false;
            const user_type = this.#guardProvider.driver === 'eloquent' ? this.#guardProvider.model.name : this.#guardProvider.database;
            const data = await RawSqlExecutor.runNoLogs(`SELECT * FROM ${this.#jwtTable} WHERE token = ? and user_type = ? and is_revoked = ? and expires_at > ?`, [token, user_type, 0, Carbon.getDateTime()]);
            if (data.length){
                return true;
            }
            return false;
        }
        return false;
    }
    async attempt(data){
        const selectKey = Object.keys(data);
        if (selectKey.length !== 2){
            throw new Error('Invalid data');
        }
        const selectedKey = selectKey[0] === 'password' ? selectKey[1] : selectKey[0];
        if (this.#guardDriver === 'jwt'){
            switch (this.#guardProvider.driver.toLowerCase()) {
                case ('eloquent'):
                    const eloUserType = this.#guardProvider.model.name;
                    const eloquentData = await this.#guardProvider.model
                                        .select(
                                            `${eloUserType}.*`, `CASE 
                                            WHEN OAT.token IS NOT NULL THEN OAT.token 
                                            ELSE 0 
                                            END AS token`,
                                            `OAT.expires_at`, 
                                            `OAT.is_revoked`,
                                            `OAT.id as token_id`, 
                                        )
                                        .leftJoin(`${this.#jwtTable} as OAT`, `${eloUserType}.id`, '=', 'OAT.user_id')
                                        .where(`${eloUserType}.${selectedKey}`, data[selectedKey])
                                        .first(false);
                    if (eloquentData){
                        const passedElo = await Hash.check(data.password, eloquentData.password);
                        if (!passedElo) return false;
                        const eloCheckToken = eloquentData.token != 0 ? eloquentData.token : false;
                        if (eloCheckToken && eloquentData.expires_at > Carbon.getDateTime() && eloquentData.is_revoked == 0) return eloCheckToken;
                        delete eloquentData.token;
                        delete eloquentData.expires_at;
                        delete eloquentData.is_revoked;
                        const tokenElo = this.#jwtSigner(eloquentData);
                        if (await RawSqlExecutor.run(`INSERT INTO ${this.#jwtTable} (token, user_id, 'user_type', 'expires_at') VALUES (?, ?, ?, ?)`, [tokenElo, eloquentData.id, eloUserType, config('jwt.expiration.default')])) return tokenElo;
                    }
                    break;
                case ('database'):
                    const dbUserType = this.#guardProvider.database;
                    const dbSQL = `SELECT 
                                    ${dbUserType}.*, 
                                    CASE 
                                        WHEN OAT.token IS NOT NULL THEN OAT.token 
                                        ELSE 0 
                                    END AS token,
                                    OAT.expires_at,
                                    OAT.is_revoked
                                FROM ${dbUserType}
                                LEFT JOIN oauth_access_tokens AS OAT 
                                    ON ${dbUserType}.id = OAT.user_id 
                                WHERE ${dbUserType}.id = ? LIMIT 1`;
                    const dbData = await RawSqlExecutor.run(dbSQL, [data[selectedKey]]);
                    if (dbData.length){
                        const fetchData = dbData[0];
                        const passedDB = await Hash.check(data.password, fetchData.password);
                        if (!passedDB) return false;
                        const dbCheckToken = fetchData.token!= 0? fetchData.token : false;
                        if (dbCheckToken) return dbCheckToken;
                        delete fetchData.token;
                        delete fetchData.expires_at;
                        delete fetchData.is_revoked;
                        const tokenDb = this.#jwtSigner(fetchData);
                        if (await RawSqlExecutor.run(`INSERT INTO ${this.#jwtTable} (token, user_id, 'user_type') VALUES (?, ?, ?)`, [tokenDb, fetchData.id, dbUserType])) return tokenDb;
                    }
                    
                default:
                    throw new Error('Invalid driver');
            }
        }
        return false;
    }
    user(){
        let payload = null;
        if (this.#guardDriver === 'jwt'){
            let token = this.getBearerToken();
            if (!token) return null;
            const [,middleToken,] = token.split('.');
            payload = JSON.parse(base64_decode(middleToken));
        }
        if (this.#guardProvider.driver === 'eloquent'){
            const useModel = new this.#guardProvider.model();
            const hidden = useModel.hidden;
            delete useModel.hidden;
            delete useModel.timestamp;
            delete useModel.fillable;
            delete useModel.guarded;
            // hidden.forEach((key) => {
            //     delete payload[key];
            // });
            // useModel.setIdentifier('id');
            payload = Object.assign(useModel, payload);
        }
        delete payload.token_id;
        return payload;
    }
    id(){

    }
    logout(){

    }
    #jwtSigner(payload){
        const algo = config('jwt.algorithm');
        const secretKey = config('jwt.secret_key');
        const header = {
            alg: algo,
            typ: 'JWT'
        };

        // Base64url encode header
        const base64UrlHeader = base64_encode(JSON.stringify(header));

        // Base64url encode payload
        const base64UrlPayload = base64_encode(JSON.stringify(payload));

        // Create the signature
        const data = `${base64UrlHeader}.${base64UrlPayload}`;
        const signature = crypto
            .createHmac(algo, secretKey)
            .update(data)
            .digest('base64url');

        // Return the JWT token
        return `${base64UrlHeader}.${base64UrlPayload}.${signature}`;
    }

    getBearerToken(){
        const headerToken = request.headers['authorization'];
        if (!headerToken){
            return false;
        }
        const [headerName,token] = headerToken.split(' ');
        if (headerName !== 'Bearer'){
            return false;
        }
        return token;
    }
}

class Auth {
    static guard(guard){
        return new Guarder(guard);
    }
    static check(){
        return new Guarder(defaultGuard).check();
    }
    static async attempt(data){
        return await new Guarder(defaultGuard).attempt(data);
    }
    static user(){
        return new Guarder(defaultGuard).user();
    }
    static id(){
        return new Guarder(defaultGuard).id();
    }
    static logout(){
        return new Guarder(defaultGuard).logout();
    }
}
module.exports = Auth;
