const { getAllSemesterService } = require("../services/semester.service");

async function getAllSemester(req, res) {
  try {
    const data = await getAllSemesterService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get semester error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getAllSemester,
};
