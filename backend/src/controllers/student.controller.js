const {
  getAllStudents,
  getStudentDetail,
  createNewStudent,
  updateStudentData,
  deleteStudentData,
  getStudentsByClassService,
} = require("../services/student.service");

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await updateStudentData(Number(id), req.body);

    res.json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await getAllStudents();

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await getStudentDetail(Number(id));

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const createStudent = async (req, res) => {
  try {
    const student = await createNewStudent(req.body);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteStudentData(Number(id));

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getStudentsByClassService(id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get students by class error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
};
