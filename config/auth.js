const constant = {
    default: {
        guard: "user"
    },
    guards: {
        user: {
            driver: 'session',
            provider: 'users',
        }
    },
    providers: {
        users: {
            driver: 'eloquent',
            model: require('../models/User'),
        },
    },
}

module.exports = constant;