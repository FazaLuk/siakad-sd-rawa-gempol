const express = require("express");

const router = express.Router();

const kelasController = require("../controllers/kelas.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.get(
  "/by-wali/:id",
  authMiddleware.verifyToken,
  kelasController.getKelasByWali,
);

router.get("/", authMiddleware.verifyToken, kelasController.getAllKelas);

router.post("/", authMiddleware.verifyToken, kelasController.createKelas);

router.put("/:id", authMiddleware.verifyToken, kelasController.updateKelas);

router.delete("/:id", authMiddleware.verifyToken, kelasController.deleteKelas);

module.exports = router;
