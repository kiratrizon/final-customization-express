const argon2 = require('argon2');
const crypto = require('crypto');

class Argon {
    static async hash(password) {
        const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
        const newPass = await argon2.hash(sha1Hash, { type: argon2.argon2d });
        return newPass;
    }

    static async check(password, hash) {
        const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
        const isMatch = await argon2.verify(hash, sha1Hash);
        return isMatch;
    }
}

module.exports = Argon;