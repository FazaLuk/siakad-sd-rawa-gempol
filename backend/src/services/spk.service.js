const prisma = require("../config/db");

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeCompact(value) {
  return normalizeText(value).replace(/\s/g, "");
}

function getPenghasilanScore(penghasilan = "") {
  // Accept variants like: "<1jt", "< 1 jt", "< 1 juta", "1jt-2jt", "1 jt - 2 jt", ">3jt", "> 3 juta"
  const compact = normalizeCompact(penghasilan)
    .replace(/juta/g, "jt")
    .replace(/[.]/g, "");

  if (compact.includes("<1jt") || compact.includes("<=1jt")) return 4;
  if (compact.includes("1jt-2jt") || compact.includes("1jt–2jt")) return 3;
  if (compact.includes("2jt-3jt") || compact.includes("2jt–3jt")) return 2;
  if (compact.includes(">3jt") || compact.includes(">=3jt")) return 1;

  return 0;
}

function getRumahScore(statusRumah = "") {
  // Accept variants like: "Milik Sendiri", "milik sendiri", "Mengontrak", "Kontrak", "Menumpang"
  const text = normalizeText(statusRumah);
  const compact = normalizeCompact(statusRumah);

  if (text.includes("menumpang")) return 5;
  if (text.includes("mengontrak") || text.includes("kontrak") || text.includes("ngontrak"))
    return 3;
  if (text.includes("milik") || compact.includes("miliksendiri")) return 2;

  return 0;
}

function getStatusBantuan(score) {
  if (score >= 80) return "Layak";
  if (score >= 60) return "Dipertimbangkan";
  return "Tidak Prioritas";
}

async function getSpkBantuanService() {
  const students = await prisma.siswa.findMany({
    include: {
      kelas: true,
    },

    orderBy: {
      nama_siswa: "asc",
    },
  });

  const rankingData = students.map((student) => {
    const penghasilanScore = getPenghasilanScore(student.penghasilan_ortu);

    const rumahScore = getRumahScore(student.status_rumah);

    const rawScore = penghasilanScore + rumahScore;

    // Normalisasi skor: ((penghasilanScore + rumahScore) / 9) * 100
    // Frontend lama menampilkan skor sebagai bilangan bulat (tanpa desimal).
    const totalScore = Math.round((rawScore / 9) * 100);

    return {
      id_siswa: student.id_siswa,
      id_kelas: student.id_kelas,

      nama_siswa: student.nama_siswa,

      kelas: student.kelas?.nama_kelas || "-",

      penghasilan_ortu: student.penghasilan_ortu,

      status_rumah: student.status_rumah,

      skor_penghasilan: penghasilanScore,

      skor_rumah: rumahScore,

      skor_akhir: totalScore,

      status_bantuan: getStatusBantuan(totalScore),
    };
  });

  rankingData.sort((a, b) => b.skor_akhir - a.skor_akhir);

  return rankingData.map((item, index) => ({
    ...item,

    ranking: index + 1,
    // Backward-compatible alias for older frontend modules (stats/filter)
    bantuanStatus: item.status_bantuan,
  }));
}

module.exports = {
  getSpkBantuanService,
};
