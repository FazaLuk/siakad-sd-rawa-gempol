const {
  getAllAbsensiService,
  createAbsensiService,
  updateAbsensiService,
  deleteAbsensiService,
} = require("../services/absensi.service");

async function getAllAbsensi(req, res) {
  try {
    const data = await getAllAbsensiService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get absensi error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function createAbsensi(req, res) {
  try {
    const data = await createAbsensiService(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Create absensi error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function updateAbsensi(req, res) {
  try {
    const data = await updateAbsensiService(req.params.id, req.body);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Update absensi error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function deleteAbsensi(req, res) {
  try {
    const data = await deleteAbsensiService(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Delete absensi error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getAllAbsensi,
  createAbsensi,
  updateAbsensi,
  deleteAbsensi,
};
