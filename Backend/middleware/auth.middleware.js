const JWT = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    const match = authorization?.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        return res.status(401).json({
            message: "Authorization token required"
        });
    }

    try {
        const decodedUser = JWT.verify(match[1], process.env.JWT_SECRET);

        if (!decodedUser || typeof decodedUser !== "object" || !decodedUser.id) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        req.user = decodedUser;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;
