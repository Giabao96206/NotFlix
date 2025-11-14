const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/tuphim.controllers");
router.get("/", controller.tuphim);

module.exports = router;
