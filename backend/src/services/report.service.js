const prisma = require("../config/db");
const { getSpkBantuanService } = require("./spk.service");

function mapGender(value) {
  if (value === "L") return "Laki-laki";
  if (value === "P") return "Perempuan";

  return value || "-";
}

function mapGenderFilter(value) {
  if (!value) return null;

  const normalized = String(value).trim().toLowerCase();

  if (normalized.includes("laki")) return "L";
  if (normalized.includes("perempuan")) return "P";

  return value;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toISOString().slice(0, 10);
}

function formatScore(value) {
  const score = Number(value);

  if (Number.isNaN(score)) return "-";

  return Number.isInteger(score) ? score : Number(score.toFixed(2));
}

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

async function getClassMeta(idKelas) {
  const kelas = await prisma.kelas.findUnique({
    where: { id_kelas: Number(idKelas) },
    include: { guru: true },
  });

  if (!kelas) {
    return {
      id_kelas: Number(idKelas),
      nama_kelas: "-",
      wali_kelas: "-",
    };
  }

  return {
    id_kelas: kelas.id_kelas,
    nama_kelas: kelas.nama_kelas,
    wali_kelas: kelas.guru?.nama_guru || "-",
  };
}

function buildNilaiWhere(filters = {}) {
  const where = {};

  if (filters.id_kelas) {
    where.id_kelas = Number(filters.id_kelas);
  }

  if (filters.id_mapel) {
    where.id_mapel = Number(filters.id_mapel);
  }

  if (filters.id_semester) {
    where.id_semester = Number(filters.id_semester);
  }

  if (filters.id_tahun_ajaran) {
    where.id_tahun_ajaran = Number(filters.id_tahun_ajaran);
  }

  if (!filters.id_mapel && filters.subject) {
    where.mapel = {
      nama_mapel: filters.subject,
    };
  }

  return where;
}

async function getGradesReport(filters = {}) {
  if (!filters.id_kelas) {
    return { meta: null, rows: [] };
  }

  const where = buildNilaiWhere(filters);

  const records = await prisma.nilai.findMany({
    where,
    include: nilaiInclude,
    orderBy: { id_nilai: "desc" },
  });

  const meta = await getClassMeta(filters.id_kelas);

  const rows = records.map((item) => ({
    id_nilai: item.id_nilai,
    studentId: item.id_siswa,
    studentName: item.siswa?.nama_siswa || "-",
    classId: item.id_kelas,
    className: item.kelas?.nama_kelas || "-",
    id_mapel: item.id_mapel,
    subject: item.mapel?.nama_mapel || "-",
    taskScore: formatScore(item.tugas),
    utsScore: formatScore(item.uts),
    uasScore: formatScore(item.uas),
    averageScore: formatScore(item.rata_rata),
    id_semester: item.id_semester,
    id_tahun_ajaran: item.id_tahun_ajaran,
    semester: item.semester?.nama_semester || "-",
    tahun_ajaran: item.tahun_ajaran
      ? `${item.tahun_ajaran.tahun_mulai}/${item.tahun_ajaran.tahun_selesai}`
      : "-",
  }));

  return { meta, rows };
}

async function getAttendanceReport(filters = {}) {
  if (!filters.id_kelas) {
    return { meta: null, rows: [] };
  }

  const where = {
    siswa: {
      id_kelas: Number(filters.id_kelas),
    },
  };

  if (filters.id_tahun_ajaran) {
    where.id_tahun_ajaran = Number(filters.id_tahun_ajaran);
  }

  if (filters.month) {
    const [year, month] = String(filters.month).split("-").map(Number);

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      where.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    }
  }

  const records = await prisma.absensi.findMany({
    where,
    include: {
      siswa: {
        include: {
          kelas: { include: { guru: true } },
        },
      },
      guru: true,
      tahun_ajaran: true,
    },
    orderBy: { tanggal: "desc" },
  });

  const meta = await getClassMeta(filters.id_kelas);

  const rows = records.map((item) => ({
    id_absensi: item.id_absensi,
    studentId: item.id_siswa,
    studentName: item.siswa?.nama_siswa || "-",
    classId: item.siswa?.id_kelas,
    className: item.siswa?.kelas?.nama_kelas || "-",
    date: formatDate(item.tanggal),
    status: item.status,
    id_tahun_ajaran: item.id_tahun_ajaran,
    tahun_ajaran: item.tahun_ajaran
      ? `${item.tahun_ajaran.tahun_mulai}/${item.tahun_ajaran.tahun_selesai}`
      : "-",
  }));

  return { meta, rows };
}

async function getStudentsReport(filters = {}) {
  if (!filters.id_kelas) {
    return { meta: null, rows: [] };
  }

  const genderCode = mapGenderFilter(filters.gender);

  const where = {
    id_kelas: Number(filters.id_kelas),
  };

  if (genderCode) {
    where.jenis_kelamin = genderCode;
  }

  const records = await prisma.siswa.findMany({
    where,
    include: {
      kelas: { include: { guru: true } },
    },
    orderBy: { nama_siswa: "asc" },
  });

  const meta = await getClassMeta(filters.id_kelas);

  const rows = records.map((item) => ({
    id_siswa: item.id_siswa,
    nisn: item.nisn,
    name: item.nama_siswa,
    classId: item.id_kelas,
    className: item.kelas?.nama_kelas || "-",
    gender: mapGender(item.jenis_kelamin),
    income: item.penghasilan_ortu,
    house: item.status_rumah,
  }));

  return { meta, rows };
}

async function getSpkReport(filters = {}) {
  if (!filters.id_kelas) {
    return { meta: null, rows: [] };
  }

  const meta = await getClassMeta(filters.id_kelas);
  const ranking = await getSpkBantuanService();

  let rows = ranking
    .filter((item) => Number(item.id_kelas) === Number(filters.id_kelas))
    .map((item) => ({
      id_siswa: item.id_siswa,
      ranking: item.ranking,
      name: item.nama_siswa,
      classId: item.id_kelas,
      className: item.kelas,
      income: item.penghasilan_ortu,
      house: item.status_rumah,
      bantuanScore: item.skor_akhir,
      bantuanStatus: item.status_bantuan,
    }));

  if (filters.status_bantuan) {
    rows = rows.filter(
      (item) => item.bantuanStatus === filters.status_bantuan
    );
  }

  return { meta, rows };
}

function applyKeywordFilter(rows, keyword) {
  if (!keyword) return rows;

  const normalized = String(keyword).trim().toLowerCase();

  return rows.filter((item) =>
    Object.values(item).some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(normalized)
    )
  );
}

function parseReportFilters(query = {}) {
  return {
    id_kelas: query.id_kelas ? Number(query.id_kelas) : null,
    subject: query.subject || "",
    month: query.month || "",
    gender: query.gender || "",
    status_bantuan: query.status_bantuan || "",
    id_semester: query.id_semester ? Number(query.id_semester) : null,
    id_tahun_ajaran: query.id_tahun_ajaran
      ? Number(query.id_tahun_ajaran)
      : null,
    id_mapel: query.id_mapel ? Number(query.id_mapel) : null,
    keyword: query.keyword || "",
  };
}

async function getReportByType(type, query = {}) {
  const filters = parseReportFilters(query);

  let result;

  switch (type) {
    case "grades":
    case "nilai":
      result = await getGradesReport(filters);
      break;
    case "attendance":
    case "kehadiran":
      result = await getAttendanceReport(filters);
      break;
    case "students":
    case "siswa":
      result = await getStudentsReport(filters);
      break;
    case "spk":
    case "bantuan":
      result = await getSpkReport(filters);
      break;
    default:
      throw new Error("Jenis laporan tidak dikenali");
  }

  result.rows = applyKeywordFilter(result.rows, filters.keyword);

  return result;
}

module.exports = {
  getGradesReport,
  getAttendanceReport,
  getStudentsReport,
  getSpkReport,
  getReportByType,
  parseReportFilters,
  getClassMeta,
};
