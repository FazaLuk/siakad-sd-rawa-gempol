const prisma = require("../config/db");

const absensiInclude = {
  siswa: {
    include: {
      kelas: {
        include: {
          guru: true,
        },
      },
    },
  },

  guru: true,

  tahun_ajaran: true,
};

function normalizeDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Tanggal absensi tidak valid");
  }

  return date;
}

function normalizePayload(data) {
  const allowedStatuses = ["Hadir", "Izin", "Sakit", "Alpha"];

  if (!allowedStatuses.includes(data.status)) {
    throw new Error("Status absensi tidak valid");
  }

  return {
    id_siswa: Number(data.id_siswa),
    id_guru: Number(data.id_guru),
    id_tahun_ajaran: Number(data.id_tahun_ajaran),
    tanggal: normalizeDate(data.tanggal),
    status: data.status,
    keterangan: data.keterangan || null,
  };
}

async function ensureNotDuplicate(payload, ignoredId = null) {
  const existing = await prisma.absensi.findFirst({
    where: {
      id_absensi: ignoredId
        ? {
            not: ignoredId,
          }
        : undefined,

      id_siswa: payload.id_siswa,

      tanggal: payload.tanggal,
    },
  });

  if (existing) {
    throw new Error("Absensi siswa untuk tanggal ini sudah ada");
  }
}

async function getAllAbsensiService() {
  return await prisma.absensi.findMany({
    include: absensiInclude,

    orderBy: {
      id_absensi: "desc",
    },
  });
}

async function createAbsensiService(data) {
  const payload = normalizePayload(data);

  await ensureNotDuplicate(payload);

  return await prisma.absensi.create({
    data: payload,

    include: absensiInclude,
  });
}

async function updateAbsensiService(id, data) {
  const id_absensi = Number(id);
  const payload = normalizePayload(data);

  await ensureNotDuplicate(payload, id_absensi);

  return await prisma.absensi.update({
    where: {
      id_absensi,
    },

    data: payload,

    include: absensiInclude,
  });
}

async function deleteAbsensiService(id) {
  return await prisma.absensi.delete({
    where: {
      id_absensi: Number(id),
    },
  });
}

module.exports = {
  getAllAbsensiService,
  createAbsensiService,
  updateAbsensiService,
  deleteAbsensiService,
};
