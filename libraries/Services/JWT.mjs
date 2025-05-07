import jwt from 'jsonwebtoken';


class JWT {
    static generateToken(payload = {}, secretKey = null, expiration = null, algorithm = null) {
        return jwt.sign(payload, secretKey, { expiresIn: expiration });
    }

    static verifyToken(token = '', secretKey = null, algorithm = null) {
        try {
            return jwt.verify(token, secretKey, { algorithms: [algorithm] });
        } catch (error) {
            return null;
        }
    }
}

export default JWT;