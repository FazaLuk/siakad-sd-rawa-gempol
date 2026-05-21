const prisma = require("../config/db");

async function getGuruService() {
  return await prisma.guru.findMany({
    orderBy: {
      id_guru: "desc",
    },
  });
}

async function createGuruService(data) {
  if (data.mapel_diampu) {
    const existingMapel = await prisma.mapel.findFirst({
      where: {
        nama_mapel: data.mapel_diampu,
      },
    });

    if (!existingMapel) {
      await prisma.mapel.create({
        data: {
          nama_mapel: data.mapel_diampu,

          kelompok: "Umum",
        },
      });
    }
  }

  return await prisma.guru.create({
    data,
  });
}

async function updateGuruService(id, data) {
  if (data.mapel_diampu) {
    console.log("AUTO SYNC MAPEL:", data.mapel_diampu);

    const existingMapel = await prisma.mapel.findFirst({
      where: {
        nama_mapel: data.mapel_diampu,
      },
    });

    if (!existingMapel) {
      await prisma.mapel.create({
        data: {
          nama_mapel: data.mapel_diampu,

          kelompok: "Umum",
        },
      });
    }
  }

  return await prisma.guru.update({
    where: {
      id_guru: id,
    },

    data: {
      nip: data.nip,

      nama_guru: data.nama_guru,

      jenis_guru: data.jenis_guru,

      jenis_kelamin: data.jenis_kelamin,

      mapel_diampu: data.mapel_diampu || null,
    },
  });
}

async function deleteGuruService(id) {
  return await prisma.guru.delete({
    where: {
      id_guru: id,
    },
  });
}

async function getWaliKelasService() {
  return await prisma.guru.findMany({
    where: {
      jenis_guru: {
        in: ["Wali Kelas", "Wali Kelas & Guru Mata Pelajaran"],
      },
    },

    include: {
      kelas: true,
    },

    orderBy: {
      nama_guru: "asc",
    },
  });
}

module.exports = {
  getGuruService,
  createGuruService,
  updateGuruService,
  deleteGuruService,
  getWaliKelasService,
};
