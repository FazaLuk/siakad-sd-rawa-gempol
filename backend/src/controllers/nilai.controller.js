const {
  getAllNilaiService,
  createNilaiService,
  updateNilaiService,
  deleteNilaiService,
} = require("../services/nilai.service");

async function getAllNilai(req, res) {
  try {
    const data = await getAllNilaiService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get nilai error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function createNilai(req, res) {
  try {
    const data = await createNilaiService(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Create nilai error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function updateNilai(req, res) {
  try {
    const data = await updateNilaiService(req.params.id, req.body);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Update nilai error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function deleteNilai(req, res) {
  try {
    const data = await deleteNilaiService(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Delete nilai error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getAllNilai,
  createNilai,
  updateNilai,
  deleteNilai,
};
