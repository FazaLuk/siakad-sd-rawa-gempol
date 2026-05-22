const { getReportByType } = require("./report.service");
const {
  buildReportWorkbook,
  writeWorkbookToBuffer,
} = require("../utils/reportExcel.util");

const reportTypeMap = {
  grades: "nilai",
  nilai: "nilai",
  attendance: "kehadiran",
  kehadiran: "kehadiran",
  students: "siswa",
  siswa: "siswa",
  spk: "bantuan",
  bantuan: "bantuan",
};

async function exportReport(type, query = {}) {
  const normalizedType = reportTypeMap[type];

  if (!normalizedType) {
    throw new Error("Jenis export laporan tidak dikenali");
  }

  if (!query.id_kelas) {
    throw new Error("Pilih kelas terlebih dahulu sebelum export laporan.");
  }

  const { meta, rows } = await getReportByType(normalizedType, query);
  const { workbook, fileName } = await buildReportWorkbook(
    normalizedType,
    meta,
    rows,
    {
      logoUrl: query.logo_url,
    },
  );
  const xlsxBuffer = await writeWorkbookToBuffer(workbook);

  return {
    buffer: xlsxBuffer,
    fileName,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

module.exports = {
  exportReport,
};
