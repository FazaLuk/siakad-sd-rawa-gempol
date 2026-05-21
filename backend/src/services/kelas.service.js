const prisma = require("../config/db");

async function getKelasService() {
  return await prisma.kelas.findMany({
    include: {
      guru: true,
    },

    orderBy: {
      id_kelas: "asc",
    },
  });
}

async function createKelasService(data) {
  return await prisma.kelas.create({
    data: {
      nama_kelas: data.nama_kelas,
      tingkat: Number(data.tingkat),
      id_wali_kelas: Number(data.id_wali_kelas),
    },
    include: {
      guru: true,
    },
  });
}

async function updateKelasService(id, data) {
  return await prisma.kelas.update({
    where: {
      id_kelas: id,
    },
    data: {
      nama_kelas: data.nama_kelas,
      tingkat: Number(data.tingkat),
      id_wali_kelas: Number(data.id_wali_kelas),
    },
    include: {
      guru: true,
    },
  });
}

async function deleteKelasService(id) {
  return await prisma.kelas.delete({
    where: {
      id_kelas: id,
    },
  });
}

async function getKelasByWaliService(idGuru) {
  return await prisma.kelas.findFirst({
    where: {
      id_wali_kelas: Number(idGuru),
    },

    include: {
      guru: true,
    },
  });
}

module.exports = {
  getKelasService,
  createKelasService,
  updateKelasService,
  deleteKelasService,
  getKelasByWaliService,
};
