const express = require("express");

const router = express.Router();

const tahunAjaranController = require("../controllers/tahunAjaran.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, tahunAjaranController.getAllTahunAjaran);

module.exports = router;
