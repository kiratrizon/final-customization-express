const Admin = require("../models/Admin");
const User = require("../models/User");

const constant = {
    default: {
        guard: "jwt_user"
    },
    guards: {
        "jwt_user": {
            driver: 'jwt',
            provider: 'users',
        },
        "jwt_admin": {
            driver: 'jwt',
            provider: 'admins',
        },
        'user': {
            driver: 'session',
            provider: 'users',
        }
    },
    providers: {
        users: {
            driver: 'eloquent',
            model: User,
        },
        admins: {
            driver: 'eloquent',
            model: Admin,
        },
    },
}

module.exports = constant;