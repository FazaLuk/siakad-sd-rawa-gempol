const prisma = require("../config/db");

const getAllStudents = async () => {
  return await prisma.siswa.findMany({
    include: {
      kelas: true,
    },
  });
};

const getStudentDetail = async (id) => {
  return await prisma.siswa.findUnique({
    where: {
      id_siswa: id,
    },
    include: {
      kelas: true,
      nilai: true,
      absensi: true,
      spk_bantuan: true,
    },
  });
};

const createNewStudent = async (data) => {
  return await prisma.siswa.create({
    data: {
      nisn: data.nisn,
      nama_siswa: data.nama_siswa,
      jenis_kelamin: data.jenis_kelamin,
      tanggal_lahir: new Date(data.tanggal_lahir),
      nama_ortu: data.nama_ortu,
      penghasilan_ortu: data.penghasilan_ortu,
      status_rumah: data.status_rumah,
      no_hp_ortu: data.no_hp_ortu,
      id_kelas: Number(data.id_kelas),
    },
  });
};

const updateStudentData = async (id, data) => {
  return await prisma.siswa.update({
    where: {
      id_siswa: id,
    },
    data: {
      nisn: data.nisn,
      nama_siswa: data.nama_siswa,
      jenis_kelamin: data.jenis_kelamin,
      tanggal_lahir: new Date(data.tanggal_lahir),
      nama_ortu: data.nama_ortu,
      penghasilan_ortu: data.penghasilan_ortu,
      status_rumah: data.status_rumah,
      no_hp_ortu: data.no_hp_ortu,
      id_kelas: Number(data.id_kelas),
    },
  });
};

const deleteStudentData = async (id) => {
  return await prisma.siswa.delete({
    where: {
      id_siswa: id,
    },
  });
};

const getStudentsByClassService = async (classId) => {
  return await prisma.siswa.findMany({
    where: {
      id_kelas: Number(classId),
    },

    orderBy: {
      nama_siswa: "asc",
    },

    include: {
      kelas: true,
    },
  });
};

module.exports = {
  getAllStudents,
  getStudentDetail,
  createNewStudent,
  updateStudentData,
  deleteStudentData,
  getStudentsByClassService,
};
