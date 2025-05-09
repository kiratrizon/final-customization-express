import argon2 from 'argon2';
import crypto from 'crypto';

class Argon {
    static async hash(password) {
        const salt = crypto.randomBytes(16);
        const key = env('MAIN_KEY', 'secret');

        const hmacHash = crypto.createHmac('sha256', key).update(password).digest();

        const hashedPassword = await argon2.hash(hmacHash, {
            salt: salt,
            type: argon2.argon2d,
        });
        return hashedPassword;
    }

    static async check(password, hash) {
        const key = env('MAIN_KEY', 'secret');

        const hmacHash = crypto.createHmac('sha256', key).update(password).digest();

        const isMatch = await argon2.verify(hash, hmacHash);
        return isMatch;
    }
}

export default Argon;
