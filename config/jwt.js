const Carbon = require('../libraries/Materials/Carbon');

const constant = {
    secret_key: env('JWT_SECRET_KEY'),
    oauth_db: 'oauth_access_token',
    expiration: {
        default: 60 * 24 * 365, // minutes
        refresh: 60, // minutes
    },
    algorithm: 'sha256',
};

module.exports = constant;