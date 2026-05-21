/* =========================
   REPORT CONFIG
========================== */

export const REPORT_TYPES = {
  NILAI: "nilai",
  KEHADIRAN: "kehadiran",
  SISWA: "siswa",
  BANTUAN: "bantuan",
};

export function getStatusBadgeClass(status) {
  const statusMap = {
    Hadir: "badge-success",
    Izin: "badge-warning",
    Sakit: "badge-info",
    Alpha: "badge-danger",
  };

  return statusMap[status] || "badge-warning";
}

export function getBantuanBadgeClass(status) {
  if (status === "Layak") return "badge-success";

  if (status === "Dipertimbangkan") return "badge-warning";

  return "badge-danger";
}

export function getReportEmptyMessage(reportType) {
  const messageMap = {
    [REPORT_TYPES.NILAI]: "Belum ada data",
    [REPORT_TYPES.KEHADIRAN]: "Belum ada data",
    [REPORT_TYPES.SISWA]: "Belum ada data",
    [REPORT_TYPES.BANTUAN]: "Belum ada data",
  };

  return messageMap[reportType] || "Belum ada data";
}

export function getFilteredEmptyMessage(reportType) {
  const messageMap = {
    [REPORT_TYPES.NILAI]: "Belum ada data",
    [REPORT_TYPES.KEHADIRAN]: "Belum ada data",
    [REPORT_TYPES.SISWA]: "Belum ada data",
    [REPORT_TYPES.BANTUAN]: "Belum ada data",
  };

  return messageMap[reportType] || "Belum ada data";
}
