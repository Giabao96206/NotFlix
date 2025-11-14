const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/admin/quantriphim.controllers");
router.get("/", controller.phim);

module.exports = router;
