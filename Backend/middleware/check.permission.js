const pool = require("../Config/Connection");

const permissionsByRole = {
    admin: ["delete_all"],
    user: []
};

const checkPermission = (permission) => {
    return async (req, res, next) => {
        if (!req.user?.id) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        try {
            const result = await pool.query(
                "SELECT role FROM users WHERE id=$1",
                [req.user.id]
            );

            const role = result.rows[0]?.role;
            const permissions = permissionsByRole[role] || [];

            if (!permissions.includes(permission)) {
                return res.status(403).json({
                    message: "Permission denied"
                });
            }

            return next();
        } catch (error) {
            console.error("Permission check failed:", error);
            return res.status(500).json({
                message: "Internal server error"
            });
        }
    };
};

module.exports = checkPermission;
