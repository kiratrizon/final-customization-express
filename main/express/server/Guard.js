const Hash = require("../../../libraries/Services/Hash");
const JWT = require("../../../libraries/Services/JWT");
const DB = require("../../database/Manager/DB");
const jwtObj = config('jwt');

class Guard {
    #driver; // session, jwt
    #model;
    #isModel;
    #table;
    constructor(driver, modelOrTable, driverProvider) {
        let isModel = driverProvider === 'eloquent';
        this.#driver = driver;
        this.#isModel = isModel;
        if (isModel) {
            this.#model = modelOrTable;
        } else {
            this.#table = modelOrTable;
        }
    }

    async attempt(data = {}) {
        if (!is_object(data)) {
            return false;
        }
        let key = 'email';
        if (this.#isModel && method_exist(this.#model, 'getUsername')) {
            key = this.#model.getUsername();
        }

        if (isset(data[key])) {
            let user;
            if (this.#isModel) {
                user = await this.#model.where(key, data[key]).first();
            } else {
                user = DB.table(this.#table).where(key, data[key]).first();
            }
            if (user) {
                if (Hash.check(user.password, data.password)) {
                    if (this.#driver === 'jwt') {
                        let filtered = only(user, ['id', key]);
                        return JWT.generateToken(filtered, jwtObj.secret_key, jwtObj.expiration.default * 60, jwtObj.algorithm);
                    } else if (this.#driver === 'session') {
                        return user;
                    }
                }
            }
        }
        return null;
    }

    check() {
        if (this.#driver === 'jwt') {
            // Get token from Authorization header
            const token = request().header('Authorization');

            // If no token is provided, return false
            if (empty(token)) {
                return false;
            }

            // Remove the 'Bearer ' part from the token string
            const cleanedToken = token.replace('Bearer ', '');

            try {
                // Verify the token using JWT and your secret key
                const decoded = JWT.verifyToken(cleanedToken, jwtObj.secret_key, jwtObj.algorithm);

                return decoded;
            } catch (error) {
                // If verification fails (expired, invalid token), return false
                return false;
            }
        }
    }
}

module.exports = Guard;