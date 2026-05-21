const express = require("express");

const router = express.Router();

const mapelController = require("../controllers/mapel.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, mapelController.getAllMapel);

module.exports = router;
