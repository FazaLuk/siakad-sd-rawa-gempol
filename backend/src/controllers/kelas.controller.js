const {
  createKelasService,
  deleteKelasService,
  getKelasService,
  updateKelasService,
  getKelasByWaliService,
} = require("../services/kelas.service");

async function getAllKelas(req, res) {
  try {
    const kelas = await getKelasService();

    res.status(200).json({
      success: true,
      data: kelas,
    });
  } catch (error) {
    console.error("Get kelas error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data kelas",
    });
  }
}

async function createKelas(req, res) {
  try {
    const kelas = await createKelasService(req.body);

    res.status(201).json({
      success: true,
      message: "Kelas created successfully",
      data: kelas,
    });
  } catch (error) {
    console.error("Create kelas error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function updateKelas(req, res) {
  try {
    const { id } = req.params;

    const kelas = await updateKelasService(Number(id), req.body);

    res.json({
      success: true,
      message: "Kelas updated successfully",
      data: kelas,
    });
  } catch (error) {
    console.error("Update kelas error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function deleteKelas(req, res) {
  try {
    const { id } = req.params;

    await deleteKelasService(Number(id));

    res.json({
      success: true,
      message: "Kelas deleted successfully",
    });
  } catch (error) {
    console.error("Delete kelas error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function getKelasByWali(req, res) {
  try {
    const { id } = req.params;

    const data = await getKelasByWaliService(id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get kelas by wali error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  getAllKelas,
  createKelas,
  updateKelas,
  deleteKelas,
  getKelasByWali,
};
