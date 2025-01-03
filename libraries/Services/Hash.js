const crypto = require('crypto');
const bcrypt = require('bcrypt');
const bcryptjs = require('bcryptjs');
const argon2 = require('argon2');
const deasync = require('deasync');

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
		} else if (hasher === 'argon2') {
			let hash = null;
			argon2.hash(sha1Hash, { type: argon2.argon2d }).then((result) => {
				hash = result;
			}).catch((err) => {
				throw new Error('Error hashing with Argon2: ' + err);
			});

			while (hash === null) {
				deasync.sleep(100);
			}

			return hash;
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
		} else if (hasher === 'argon2') {
			let isValid = false;
			argon2.verify(hash, sha1Hash).then((result) => {
				isValid = result;
			}).catch((err) => {
				throw new Error('Error verifying with Argon2: ' + err);
			});

			while (!isValid) {
				deasync.sleep(100);
			}

			return isValid;
		} else {
			throw new Error('Unsupported hasher');
		}
	}
}

module.exports = Hash;
