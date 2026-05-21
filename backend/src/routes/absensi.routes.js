const express = require("express");

const router = express.Router();

const absensiController = require("../controllers/absensi.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, absensiController.getAllAbsensi);

router.post("/", verifyToken, absensiController.createAbsensi);

router.put("/:id", verifyToken, absensiController.updateAbsensi);

router.delete("/:id", verifyToken, absensiController.deleteAbsensi);

module.exports = router;
