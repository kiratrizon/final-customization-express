import Admin from "../models/Admin.mjs";
import User from "../models/User.mjs";


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

export default constant;