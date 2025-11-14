const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/admin/trangchu.controllers");
router.get("/", controller.trangchu);

module.exports = router;
