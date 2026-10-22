const express = require("express");
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
const router = express.Router();

router.post(
  "/signup",
  auditLogger({
    action: "UPDATE",
    entity: "users",
  }),
  Singup,
);
router.post("/login", login);
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
