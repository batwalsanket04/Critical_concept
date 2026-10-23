const express = require("express");
const authLimiter=require("../middleware/authLimiter")
const {
  Singup,
  login,
  getUserById,
  updateUser,
  deleteByID,
  refreshToken,
  deleteAllUsers,
  getAllData,
} = require("../Controller/user.controller");
const checkPermission = require("../middleware/check.permission");
const authMiddleware = require("../middleware/auth.middleware");
const auditLogger = require("../middleware/auditLogger");
const validate=require('../middleware/validate.middleware');
const { signupSchema, loginSchema } = require("../Validation/user.validation");
const router = express.Router();

router.post(

"/signup",

authLimiter,

validate(signupSchema),

auditLogger({

 action:"CREATE",

 entity:"users"

}),

Singup

);
router.post("/login",authLimiter,validate(loginSchema), login);
router.get("/getalldata", authMiddleware, getAllData);
router.get("/users/:id", getUserById);
router.put(
  "/users/:id",
  auditLogger({
    action: "UPDATE",
    entity: "users",
  }),
  updateUser,
);
router.delete(
  "/users/:id",
  auditLogger({
    action: "UPDATE",
    entity: "users",
  }),
  deleteByID,
);
router.delete(
  "/deleteallusers",
  authMiddleware,
  checkPermission("delete_all"),
  deleteAllUsers,
);

router.get("/refresh-token", refreshToken);

module.exports = router;
