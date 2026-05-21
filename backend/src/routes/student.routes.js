const express = require("express");
const router = express.Router();

const {
  getStudents,
  getStudentById,
  getStudentsByClass,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/student.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/by-class/:id", verifyToken, getStudentsByClass);

router.get("/", verifyToken, getStudents);

router.get("/:id", verifyToken, getStudentById);

router.post("/", verifyToken, createStudent);

router.put("/:id", verifyToken, updateStudent);

router.delete("/:id", verifyToken, deleteStudent);

module.exports = router;
