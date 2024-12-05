const Carbon = require("../../../libraries/Materials/Carbon");
const RawSqlExecutor = require("../../../libraries/Materials/RawSqlExecutor");
const crypto = require('crypto');

class JWTAuth {
    static getToken(){
        const headerToken = REQUEST.headers['authorization'];
        if (!headerToken){
            return false;
        }
        const [headerName, token] = headerToken.split(' ');
        if (headerName !== 'Bearer'){
            return false;
        }
        return token;
    }

    static async verifyToken(){
        const token = this.getToken();
        if (!!token && JWTAuth.#verifySignature(token)){
            const data = await RawSqlExecutor.run(`SELECT * FROM ${config('jwt.oauth_db')} WHERE token = ? AND expires_at >= ? AND is_revoked = ?`, [token, Carbon.getDateTime(), 0]);
            if (data.length){
                return true;
            }
        }
        
        return false;
    }

    static #verifySignature(token){
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
    static revokeToken(token){
        return RawSqlExecutor.run(`UPDATE ${config('jwt.oauth_db')} SET is_revoked =? WHERE token =?`, [1, token]);
    }
}

module.exports = JWTAuth;