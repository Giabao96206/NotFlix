const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/admin/quantripeople.controllers");
router.get("/", controller.quantripeople);

module.exports = router;
