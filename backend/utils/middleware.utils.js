const jwt = require("jsonwebtoken");
const config = require('../config/config');

class MiddlewareUtils {
    static validateUser(req, res, next) {
        jwt.verify(req.headers['x-access-token'], config.secret, function (err, decoded) {
            if (err) {
                res.status(401).json({error: err.message});
            } else {
                // add user id to request
                req.body = req.body || {};
                req.body.user = decoded;
                next();
            }
        });
    }
}

module.exports = MiddlewareUtils;