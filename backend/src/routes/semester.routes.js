const express = require("express");

const router = express.Router();

const semesterController = require("../controllers/semester.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, semesterController.getAllSemester);

module.exports = router;
