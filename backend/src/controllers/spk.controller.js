const { getSpkBantuanService } = require("../services/spk.service");

async function getSpkBantuan(req, res) {
  try {
    const data = await getSpkBantuanService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get SPK bantuan error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getSpkBantuan,
};
