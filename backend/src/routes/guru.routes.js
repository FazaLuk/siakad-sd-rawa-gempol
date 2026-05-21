const express = require("express");

const router = express.Router();

const guruController = require("../controllers/guru.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.get(
  "/wali-kelas",
  authMiddleware.verifyToken,
  guruController.getWaliKelas,
);

router.get("/", authMiddleware.verifyToken, guruController.getAllGuru);

router.post("/", authMiddleware.verifyToken, guruController.createGuru);

router.put("/:id", authMiddleware.verifyToken, guruController.updateGuru);

router.delete("/:id", authMiddleware.verifyToken, guruController.deleteGuru);

module.exports = router;
