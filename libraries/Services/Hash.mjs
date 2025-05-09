import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import Boot from './Boot.mjs';

class Hash {
    static make(password) {
        const hasher = Boot.hasher();
        const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
        const mainKey = env('MAIN_KEY', 'secret');
        const combinedHash = sha1Hash + mainKey;

        if (hasher === 'bcryptjs') {
            return bcryptjs.hashSync(combinedHash, 10);
        } else if (hasher === 'crypto') {
            return crypto.createHash('sha1').update(combinedHash).digest('hex');
        } else {
            throw new Error('Unsupported hasher');
        }
    }

    static check(password, hash) {
        const hasher = Boot.hasher();
        const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
        const mainKey = env('MAIN_KEY', 'secret');
        const combinedHash = sha1Hash + mainKey;

        if (hasher === 'bcryptjs') {
            return bcryptjs.compareSync(combinedHash, hash);
        } else if (hasher === 'crypto') {
            return crypto.createHash('sha1').update(combinedHash).digest('hex') === hash;
        } else {
            throw new Error('Unsupported hasher');
        }
    }
}

export default Hash;
