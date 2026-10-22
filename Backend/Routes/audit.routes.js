const express = require("express");

const { getAuditLogs } = require("../Controller/audit.controller");

const router = express.Router();


router.get(
    "/audit-log",
    getAuditLogs
);


module.exports = router;