const { getAllTahunAjaranService } = require("../services/tahunAjaran.service");

async function getAllTahunAjaran(req, res) {
  try {
    const data = await getAllTahunAjaranService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get tahun ajaran error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getAllTahunAjaran,
};
