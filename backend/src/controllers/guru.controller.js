const {
  createGuruService,
  deleteGuruService,
  getGuruService,
  updateGuruService,
  getWaliKelasService,
} = require("../services/guru.service");

async function getAllGuru(req, res) {
  try {
    const guru = await getGuruService();

    res.status(200).json({
      success: true,
      data: guru,
    });
  } catch (error) {
    console.error("Get guru error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data guru",
    });
  }
}

async function createGuru(req, res) {
  try {
    const guru = await createGuruService(req.body);

    res.status(201).json({
      success: true,
      message: "Guru created successfully",
      data: guru,
    });
  } catch (error) {
    console.error("Create guru error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function updateGuru(req, res) {
  try {
    const { id } = req.params;

    const guru = await updateGuruService(Number(id), req.body);

    res.json({
      success: true,
      message: "Guru updated successfully",
      data: guru,
    });
  } catch (error) {
    console.error("Update guru error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function deleteGuru(req, res) {
  try {
    const { id } = req.params;

    await deleteGuruService(Number(id));

    res.json({
      success: true,
      message: "Guru deleted successfully",
    });
  } catch (error) {
    console.error("Delete guru error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function getWaliKelas(req, res) {
  try {
    const data = await getWaliKelasService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get wali kelas error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getAllGuru,
  createGuru,
  updateGuru,
  deleteGuru,
  getWaliKelas,
};
