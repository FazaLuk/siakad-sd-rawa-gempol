const express = require("express");

const router = express.Router();

const nilaiController = require("../controllers/nilai.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, nilaiController.getAllNilai);

router.post("/", verifyToken, nilaiController.createNilai);

router.put("/:id", verifyToken, nilaiController.updateNilai);

router.delete("/:id", verifyToken, nilaiController.deleteNilai);

module.exports = router;
