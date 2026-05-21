const express = require("express");

const router = express.Router();

const kelasController = require("../controllers/kelas.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware.verifyToken, kelasController.getAllKelas);

module.exports = router;
