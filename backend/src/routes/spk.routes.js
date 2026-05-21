const express = require("express");

const router = express.Router();

const spkController = require("../controllers/spk.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, spkController.getSpkBantuan);

module.exports = router;
