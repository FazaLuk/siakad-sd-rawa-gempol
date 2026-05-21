console.log("Laporan page connected");

import { getKelas } from "../api/kelas.api.js";
import { getMapel, getSemester, getTahunAjaran } from "../api/nilai.api.js";
import {
  downloadReportExport,
  getAttendanceReport,
  getGradesReport,
  getSpkReport,
  getStudentsReport,
} from "../api/report.api.js";
import {
  getBantuanBadgeClass,
  getFilteredEmptyMessage,
  getReportEmptyMessage,
  getStatusBadgeClass,
  REPORT_TYPES,
} from "../modules/laporan.js";

/* =========================
   ELEMENT
========================== */

const reportType = document.getElementById("reportType");
const searchInput = document.getElementById("searchLaporan");
const filterClass = document.getElementById("filterClass");
const filterSubject = document.getElementById("filterSubject");
const filterMonth = document.getElementById("filterMonth");
const filterGender = document.getElementById("filterGender");
const filterBantuanStatus = document.getElementById("filterBantuanStatus");
const resetFilterBtn = document.querySelector(".filter-reset-btn");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const printPreviewBtn = document.getElementById("printPreviewBtn");
const tableHead = document.getElementById("laporanTableHead");
const tableBody = document.getElementById("laporanTableBody");
const pagination = document.getElementById("pagination");
const reportTitle = document.getElementById("reportTitle");
const reportDescription = document.getElementById("reportDescription");
const reportTotal = document.getElementById("reportTotal");
const reportClassName = document.getElementById("reportClassName");
const reportFilterCount = document.getElementById("reportFilterCount");

let currentPage = 1;
let currentFilteredData = [];
let reportSourceData = [];
let kelasData = [];
let mapelList = [];
let activeSemester = null;
let activeTahunAjaran = null;
const rowsPerPage = 5;

const reportConfig = {
  [REPORT_TYPES.NILAI]: {
    title: "Laporan Nilai",
    shortTitle: "Nilai",
    description: "Preview nilai siswa berdasarkan kelas dan mata pelajaran",
    source: "nilaiData",
    fileNamePrefix: "laporan-nilai",
    sheetName: "Laporan Nilai",
  },
  [REPORT_TYPES.KEHADIRAN]: {
    title: "Laporan Kehadiran",
    shortTitle: "Kehadiran",
    description: "Preview absensi siswa berdasarkan kelas dan bulan",
    source: "kehadiranData",
    fileNamePrefix: "laporan-kehadiran",
    sheetName: "Laporan Kehadiran",
  },
  [REPORT_TYPES.SISWA]: {
    title: "Laporan Data Siswa",
    shortTitle: "Siswa",
    description: "Preview data siswa berdasarkan kelas dan jenis kelamin",
    source: "studentData",
    fileNamePrefix: "laporan-siswa",
    sheetName: "Laporan Siswa",
  },
  [REPORT_TYPES.BANTUAN]: {
    title: "Laporan SPK Bantuan",
    shortTitle: "SPK",
    description: "Preview ranking bantuan berdasarkan kelas dan status",
    source: "studentData",
    fileNamePrefix: "laporan-spk",
    sheetName: "Laporan SPK",
  },
};

/* =========================
   DROPDOWN
========================== */

async function renderClassDropdown() {
  try {
    kelasData = await getKelas();

    filterClass.innerHTML = `
      <option value="">Pilih Kelas</option>
      ${kelasData
        .map((item) => `<option value="${item.id}">${item.name}</option>`)
        .join("")}
    `;
  } catch (error) {
    console.error("Render kelas dropdown error:", error);
  }
}

async function resolveActiveAcademicPeriod() {
  try {
    const semesters = await getSemester();
    const tahunAjaran = await getTahunAjaran();

    activeTahunAjaran =
      tahunAjaran.find((item) => item.aktif) || tahunAjaran[0] || null;

    activeSemester =
      semesters.find(
        (item) =>
          item.aktif &&
          (!activeTahunAjaran ||
            Number(item.id_tahun_ajaran) ===
              Number(activeTahunAjaran.id_tahun_ajaran))
      ) ||
      semesters.find((item) => item.aktif) ||
      semesters[0] ||
      null;

    if (activeSemester?.id_tahun_ajaran) {
      activeTahunAjaran =
        tahunAjaran.find(
          (item) =>
            Number(item.id_tahun_ajaran) ===
            Number(activeSemester.id_tahun_ajaran)
        ) || activeTahunAjaran;
    }
  } catch (error) {
    console.error("Resolve periode akademik error:", error);
    activeSemester = null;
    activeTahunAjaran = null;
  }
}

async function renderSubjectDropdown() {
  try {
    mapelList = await getMapel();

    filterSubject.innerHTML = `
      <option value="">Semua Mata Pelajaran</option>
      ${mapelList
        .map(
          (item) => `
            <option value="${item.id_mapel}">
              ${item.nama_mapel || item.name}
            </option>
          `
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Render mapel dropdown error:", error);
  }
}

/* =========================
   FILTER UI
========================== */

function hideDynamicFilters() {
  filterSubject.hidden = true;
  filterMonth.hidden = true;
  filterGender.hidden = true;
  filterBantuanStatus.hidden = true;
}

function updateDynamicFilters() {
  hideDynamicFilters();

  if (reportType.value === REPORT_TYPES.NILAI) {
    filterSubject.hidden = false;
  }

  if (reportType.value === REPORT_TYPES.KEHADIRAN) {
    filterMonth.hidden = false;
  }

  if (reportType.value === REPORT_TYPES.SISWA) {
    filterGender.hidden = false;
  }

  if (reportType.value === REPORT_TYPES.BANTUAN) {
    filterBantuanStatus.hidden = false;
  }
}

function resetDynamicFilterValues() {
  filterSubject.value = "";
  filterMonth.value = "";
  filterGender.value = "";
  filterBantuanStatus.value = "";
}

function updateReportHeader(totalData) {
  const selectedConfig = reportConfig[reportType.value];
  const selectedKelas = getSelectedKelas();
  const activeFilters = [
    searchInput.value.trim(),
    filterClass.value,
    filterSubject.value,
    filterMonth.value,
    filterGender.value,
    filterBantuanStatus.value,
  ].filter(Boolean).length;

  reportTitle.textContent = selectedConfig.shortTitle;
  reportDescription.textContent = selectedConfig.description;
  reportTotal.textContent = totalData;
  reportClassName.textContent = selectedKelas ? selectedKelas.name : "-";
  reportFilterCount.textContent = activeFilters;
}

function getSelectedKelas() {
  return kelasData.find(
    (item) => Number(item.id) === Number(filterClass.value)
  );
}

function getSelectedClassInfo() {
  const selectedKelas = getSelectedKelas();

  if (!selectedKelas) {
    return {
      className: "-",
      homeroomTeacher: "-",
    };
  }

  return {
    className: selectedKelas.name,
    homeroomTeacher: selectedKelas.homeroomTeacher || "-",
  };
}

function buildReportQueryParams() {
  const params = {
    id_kelas: filterClass.value,
    month: filterMonth.value,
    gender: filterGender.value,
    status_bantuan: filterBantuanStatus.value,
    keyword: searchInput.value.trim(),
  };

  if (filterSubject.value) {
    params.id_mapel = filterSubject.value;
  }

  if (
    reportType.value === REPORT_TYPES.KEHADIRAN &&
    activeTahunAjaran?.id_tahun_ajaran
  ) {
    params.id_tahun_ajaran = activeTahunAjaran.id_tahun_ajaran;
  }

  return params;
}

function buildExportQueryParams() {
  return buildReportQueryParams();
}

async function loadReportData() {
  if (!filterClass.value) {
    reportSourceData = [];
    return;
  }

  const params = buildReportQueryParams();

  try {
    if (reportType.value === REPORT_TYPES.NILAI) {
      reportSourceData = await getGradesReport(params);
      return;
    }

    if (reportType.value === REPORT_TYPES.KEHADIRAN) {
      reportSourceData = await getAttendanceReport(params);
      return;
    }

    if (reportType.value === REPORT_TYPES.SISWA) {
      reportSourceData = await getStudentsReport(params);
      return;
    }

    reportSourceData = await getSpkReport(params);
  } catch (error) {
    console.error("Load report data error:", error);
    reportSourceData = [];
  }
}

/* =========================
   TABLE TEMPLATE
========================== */

function renderTableHead() {
  const headMap = {
    [REPORT_TYPES.NILAI]: `
      <tr>
        <th>No</th>
        <th>Nama Siswa</th>
        <th>Kelas</th>
        <th>Mata Pelajaran</th>
        <th>Tugas</th>
        <th>UTS</th>
        <th>UAS</th>
        <th>Rata-rata</th>
      </tr>
    `,
    [REPORT_TYPES.KEHADIRAN]: `
      <tr>
        <th>No</th>
        <th>Nama Siswa</th>
        <th>Kelas</th>
        <th>Tanggal</th>
        <th>Status</th>
      </tr>
    `,
    [REPORT_TYPES.SISWA]: `
      <tr>
        <th>No</th>
        <th>NISN</th>
        <th>Nama Siswa</th>
        <th>Kelas</th>
        <th>Jenis Kelamin</th>
        <th>Penghasilan Orang Tua</th>
        <th>Status Rumah</th>
      </tr>
    `,
    [REPORT_TYPES.BANTUAN]: `
      <tr>
        <th>Ranking</th>
        <th>Nama Siswa</th>
        <th>Kelas</th>
        <th>Penghasilan Orang Tua</th>
        <th>Status Rumah</th>
        <th>Skor Akhir</th>
        <th>Status Bantuan</th>
      </tr>
    `,
  };

  tableHead.innerHTML = headMap[reportType.value];
}

function renderRow(item, index, start) {
  const rowNumber = start + index + 1;

  if (reportType.value === REPORT_TYPES.NILAI) {
    return `
      <tr>
        <td>${rowNumber}</td>
        <td>${item.studentName}</td>
        <td><span class="class-badge class-blue">${item.className}</span></td>
        <td>${item.subject}</td>
        <td>${item.taskScore}</td>
        <td>${item.utsScore}</td>
        <td>${item.uasScore}</td>
        <td><span class="status-badge badge-success">${item.averageScore}</span></td>
      </tr>
    `;
  }

  if (reportType.value === REPORT_TYPES.KEHADIRAN) {
    return `
      <tr>
        <td>${rowNumber}</td>
        <td>${item.studentName}</td>
        <td><span class="class-badge class-blue">${item.className}</span></td>
        <td>${item.date}</td>
        <td>
          <span class="status-badge ${getStatusBadgeClass(item.status)}">
            ${item.status}
          </span>
        </td>
      </tr>
    `;
  }

  if (reportType.value === REPORT_TYPES.SISWA) {
    return `
      <tr>
        <td>${rowNumber}</td>
        <td>${item.nisn || "-"}</td>
        <td>${item.name}</td>
        <td><span class="class-badge class-blue">${item.className}</span></td>
        <td>${item.gender || "-"}</td>
        <td><span class="income-badge income-orange">${item.income || "-"}</span></td>
        <td>${item.house || "-"}</td>
      </tr>
    `;
  }

  return `
    <tr>
      <td><span class="status-badge badge-info">#${item.ranking || rowNumber}</span></td>
      <td>${item.name}</td>
      <td><span class="class-badge class-blue">${item.className}</span></td>
      <td><span class="income-badge income-orange">${item.income || "-"}</span></td>
      <td>${item.house || "-"}</td>
      <td><span class="status-badge badge-info">${item.bantuanScore}</span></td>
      <td>
        <span class="status-badge ${getBantuanBadgeClass(item.bantuanStatus)}">
          ${item.bantuanStatus}
        </span>
      </td>
    </tr>
  `;
}

/* =========================
   RENDER TABLE
========================== */

function renderLaporan(data, hasReportData) {
  tableBody.innerHTML = "";
  renderTableHead();

  const columnCount = tableHead.querySelectorAll("th").length;
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!hasReportData) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="${columnCount}" class="text-center">
          ${getReportEmptyMessage(reportType.value)}
        </td>
      </tr>
    `;
    return;
  }

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="${columnCount}" class="text-center">
          ${getFilteredEmptyMessage(reportType.value)}
        </td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((item, index) => {
    tableBody.innerHTML += renderRow(item, index, start);
  });
}

function renderPagination(data) {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(data.length / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <button
        class="pagination-btn ${currentPage === i ? "active" : ""}"
        data-page="${i}"
      >
        ${i}
      </button>
    `;
  }

  document.querySelectorAll(".pagination-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = Number(button.dataset.page);
      filterLaporan();
    });
  });
}

/* =========================
   FILTER SYSTEM
========================== */

function matchKeyword(item, keyword) {
  if (!keyword) return true;

  return Object.values(item).some((value) =>
    String(value || "").toLowerCase().includes(keyword)
  );
}

function filterLaporan() {
  const keyword = searchInput.value.toLowerCase();
  const selectedClass = Number(filterClass.value);
  const selectedSubject = filterSubject.value;
  const selectedMonth = filterMonth.value;
  const selectedGender = filterGender.value;
  const selectedBantuanStatus = filterBantuanStatus.value;
  const sourceData = reportSourceData;

  if (!selectedClass) {
    currentFilteredData = [];
    updateReportHeader(0);
    renderTableHead();
    tableBody.innerHTML = `
      <tr>
        <td colspan="${tableHead.querySelectorAll("th").length}" class="text-center">
          Pilih kelas terlebih dahulu untuk menampilkan preview laporan
        </td>
      </tr>
    `;
    pagination.innerHTML = "";
    return;
  }

  const filtered = sourceData.filter((item) => {
    const matchSearch = matchKeyword(item, keyword);
    const matchClass = Number(item.classId) === selectedClass;
    const matchSubject =
      reportType.value !== REPORT_TYPES.NILAI ||
      !selectedSubject ||
      Number(item.id_mapel) === Number(selectedSubject);
    const matchMonth =
      reportType.value !== REPORT_TYPES.KEHADIRAN ||
      !selectedMonth ||
      item.date?.startsWith(selectedMonth);
    const matchGender =
      reportType.value !== REPORT_TYPES.SISWA ||
      !selectedGender ||
      item.gender === selectedGender;
    const matchBantuanStatus =
      reportType.value !== REPORT_TYPES.BANTUAN ||
      !selectedBantuanStatus ||
      item.bantuanStatus === selectedBantuanStatus;

    return (
      matchSearch &&
      matchClass &&
      matchSubject &&
      matchMonth &&
      matchGender &&
      matchBantuanStatus
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  currentFilteredData = filtered;
  updateReportHeader(filtered.length);
  renderLaporan(filtered, sourceData.length > 0);
  renderPagination(filtered);
}

/* =========================
   EXPORT
========================== */

function downloadExportFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportLaporanExcel() {
  if (!filterClass.value) {
    alert("Pilih satu kelas terlebih dahulu sebelum export laporan.");
    return;
  }

  exportExcelBtn.disabled = true;
  exportExcelBtn.innerHTML = `
    <i class="bi bi-hourglass-split"></i>
    Menyiapkan Excel
  `;

  try {
    const result = await downloadReportExport(
      reportType.value,
      buildExportQueryParams()
    );

    if (!result) return;

    downloadExportFile(result.blob, result.fileName);
  } catch (error) {
    console.error("Gagal export laporan Excel", error);
    alert(error.message || "Export Excel gagal. Coba lagi.");
  } finally {
    exportExcelBtn.disabled = false;
    exportExcelBtn.innerHTML = `
      <i class="bi bi-file-earmark-excel-fill"></i>
      Export Excel
    `;
  }
}

reportType.addEventListener("change", async () => {
  currentPage = 1;
  searchInput.value = "";
  resetDynamicFilterValues();
  updateDynamicFilters();
  await loadReportData();
  filterLaporan();
});

[
  searchInput,
  filterClass,
  filterSubject,
  filterMonth,
  filterGender,
  filterBantuanStatus,
].forEach((input) => {
  input.addEventListener("input", () => {
    currentPage = 1;
    filterLaporan();
  });

  input.addEventListener("change", async () => {
    currentPage = 1;

    if (
      input === filterClass ||
      (input === filterSubject && reportType.value === REPORT_TYPES.NILAI)
    ) {
      await loadReportData();
    }

    filterLaporan();
  });
});

resetFilterBtn.addEventListener("click", async () => {
  searchInput.value = "";
  resetDynamicFilterValues();
  currentPage = 1;

  if (filterClass.value) {
    await loadReportData();
  } else {
    reportSourceData = [];
  }

  filterLaporan();
});

exportExcelBtn.addEventListener("click", exportLaporanExcel);

printPreviewBtn.addEventListener("click", () => {
  window.print();
});

async function initLaporanPage() {
  await resolveActiveAcademicPeriod();
  await renderClassDropdown();
  await renderSubjectDropdown();
  updateDynamicFilters();
  filterLaporan();
}

initLaporanPage();

console.log("Laporan rendered");
