const prisma = require("../config/db");

const nilaiInclude = {
  siswa: true,

  kelas: {
    include: {
      guru: true,
    },
  },

  mapel: true,

  semester: true,

  tahun_ajaran: true,
};

function calculateRataRata(data) {
  const tugas = Number(data.tugas);
  const uts = Number(data.uts);
  const uas = Number(data.uas);

  return {
    tugas,
    uts,
    uas,
    rata_rata: (tugas + uts + uas) / 3,
  };
}

async function getAllNilaiService() {
  return await prisma.nilai.findMany({
    include: nilaiInclude,

    orderBy: {
      id_nilai: "desc",
    },
  });
}

async function createNilaiService(data) {
  const { tugas, uts, uas, rata_rata } = calculateRataRata(data);

  const existing = await prisma.nilai.findFirst({
    where: {
      id_siswa: Number(data.id_siswa),

      id_mapel: Number(data.id_mapel),

      id_semester: Number(data.id_semester),

      id_tahun_ajaran: Number(data.id_tahun_ajaran),
    },
  });

  if (existing) {
    throw new Error("Nilai siswa untuk mapel dan semester ini sudah ada");
  }

  return await prisma.nilai.create({
    data: {
      id_siswa: Number(data.id_siswa),

      id_kelas: Number(data.id_kelas),

      id_mapel: Number(data.id_mapel),

      id_semester: Number(data.id_semester),

      id_tahun_ajaran: Number(data.id_tahun_ajaran),

      tugas,

      uts,

      uas,

      rata_rata,
    },

    include: nilaiInclude,
  });
}

async function updateNilaiService(id, data) {
  const id_nilai = Number(id);
  const { tugas, uts, uas, rata_rata } = calculateRataRata(data);

  const existing = await prisma.nilai.findFirst({
    where: {
      id_nilai: {
        not: id_nilai,
      },

      id_siswa: Number(data.id_siswa),

      id_mapel: Number(data.id_mapel),

      id_semester: Number(data.id_semester),

      id_tahun_ajaran: Number(data.id_tahun_ajaran),
    },
  });

  if (existing) {
    throw new Error("Nilai siswa untuk mapel dan semester ini sudah ada");
  }

  return await prisma.nilai.update({
    where: {
      id_nilai,
    },

    data: {
      id_siswa: Number(data.id_siswa),

      id_kelas: Number(data.id_kelas),

      id_mapel: Number(data.id_mapel),

      id_semester: Number(data.id_semester),

      id_tahun_ajaran: Number(data.id_tahun_ajaran),

      tugas,

      uts,

      uas,

      rata_rata,
    },

    include: nilaiInclude,
  });
}

async function deleteNilaiService(id) {
  return await prisma.nilai.delete({
    where: {
      id_nilai: Number(id),
    },
  });
}

module.exports = {
  getAllNilaiService,
  createNilaiService,
  updateNilaiService,
  deleteNilaiService,
};
