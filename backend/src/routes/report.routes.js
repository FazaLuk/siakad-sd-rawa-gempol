const express = require("express");

const router = express.Router();

const reportController = require("../controllers/report.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/grades", verifyToken, reportController.getGradesReport);
router.get("/attendance", verifyToken, reportController.getAttendanceReport);
router.get("/students", verifyToken, reportController.getStudentsReport);
router.get("/spk", verifyToken, reportController.getSpkReport);

router.get("/export/grades", verifyToken, reportController.exportGradesReport);
router.get(
  "/export/attendance",
  verifyToken,
  reportController.exportAttendanceReport
);
router.get("/export/students", verifyToken, reportController.exportStudentsReport);
router.get("/export/spk", verifyToken, reportController.exportSpkReport);

module.exports = router;
