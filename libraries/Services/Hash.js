const crypto = require('crypto');
const bcrypt = require('bcrypt');
const bcryptjs = require('bcryptjs');

const Boot = require('./Boot');

class Hash {
    static make(password) {
        const hasher = Boot.hasher();
        const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');

        if (hasher === 'bcrypt') {
            return bcrypt.hashSync(sha1Hash, 10);
        } else if (hasher === 'bcryptjs') {
            return bcryptjs.hashSync(sha1Hash, 10);
        } else if (hasher === 'crypto') {
            return sha1Hash;
        } else {
            throw new Error('Unsupported hasher');
        }
    }

    static check(password, hash) {
        const hasher = Boot.hasher();
        const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');

        if (hasher === 'bcrypt') {
            return bcrypt.compareSync(sha1Hash, hash);
        } else if (hasher === 'bcryptjs') {
            return bcryptjs.compareSync(sha1Hash, hash);
        } else if (hasher === 'crypto') {
            return sha1Hash === hash;
        } else {
            throw new Error('Unsupported hasher');
        }
    }
}

module.exports = Hash;
