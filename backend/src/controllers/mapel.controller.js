const { getAllMapelService } = require("../services/mapel.service");

async function getAllMapel(req, res) {
  try {
    const data = await getAllMapelService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get mapel error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getAllMapel,
};
