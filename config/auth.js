const User = require("../models/User");

const constant = {
    default: {
        guard: "user"
    },
    guards: {
        user: {
            driver: 'jwt',
            provider: 'users',
        }
    },
    providers: {
        users: {
            driver: 'eloquent',
            model: User,
        },
    },
}

module.exports = constant;