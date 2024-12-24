const crypto = require('crypto');
const bcrypt = require('bcrypt');  // Modern bcrypt
const bcryptjs = require('bcryptjs');  // bcryptjs for compatibility
const Boot = require('./Boot');

class Hash {
	static make(password) {
		const hasher = Boot.hasher();
		const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');  // Hash the password with SHA-1

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
		const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');  // Hash the password with SHA-1

		if (hasher === 'bcrypt') {
			// Using bcrypt (synchronously)
			return bcrypt.compareSync(sha1Hash, hash);  // Compare synchronously with bcrypt
		} else if (hasher === 'bcryptjs') {
			// Using bcryptjs (synchronously)
			return bcryptjs.compareSync(sha1Hash, hash);  // Compare synchronously with bcryptjs
		} else if (hasher === 'crypto') {
			return sha1Hash === hash;  // Direct comparison for the 'crypto' hash
		} else {
			throw new Error('Unsupported hasher');
		}
	}
}

module.exports = Hash;
