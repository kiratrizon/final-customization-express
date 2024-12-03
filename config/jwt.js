const Carbon = require('../libraries/Materials/Carbon');

const constant = {
    secret_key: env('JWT_SECRET_KEY'),
    oauth_db: 'oauth_access_token',
    expiration: {
        default: Carbon.addYears(1).getDateTime(),
        refresh: Carbon.addDays(7).getDateTime(),
    },
    algorithm: 'sha256',
};

module.exports = constant;