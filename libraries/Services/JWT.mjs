import jwt from 'jsonwebtoken';


class JWT {
    static generateToken(payload = {}, secretKey = null, expiration = null, algorithm = null) {
        if (empty(secretKey)) {
            secretKey = constant.secret_key;
        }
        if (empty(expiration)) {
            expiration = constant.expiration.default;
        }
        return jwt.sign(payload, secretKey, { expiresIn: expiration });
    }

    static verifyToken(token = '', secretKey = null, algorithm = null) {
        if (empty(secretKey)) {
            secretKey = constant.secret_key;
        }
        try {
            return jwt.verify(token, secretKey, { algorithms: [algorithm] });
        } catch (error) {
            return null;
        }
    }
}

export default JWT;