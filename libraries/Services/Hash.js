const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const argon2 = require('argon2');
const Boot = require('./Boot');

class Hash {
  static async make(password) {
    const hasher = Boot.hasher();
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');

    if (hasher === 'bcryptjs') {
      return await bcrypt.hash(sha1Hash, 10);
    } else if (hasher === 'argon2') {
      return await argon2.hash(sha1Hash);
    } else {
      throw new Error('Unsupported hasher');
    }
  }

  static async check(password, hash) {
    const hasher = Boot.hasher();
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');

    if (hasher === 'bcryptjs') {
      return await bcrypt.compare(sha1Hash, hash);
    } else if (hasher === 'argon2') {
      return await argon2.verify(hash, sha1Hash);
    } else {
      throw new Error('Unsupported hasher');
    }
  }
}

module.exports = Hash;
