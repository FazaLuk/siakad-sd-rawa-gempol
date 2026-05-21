console.log("SPK Bantuan page connected");

import { getSpkBantuan } from "../api/spk.api.js";

import { getKelas } from "../api/kelas.api.js";

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("spkBantuanTableBody");
const searchInput = document.getElementById("searchSpkBantuan");
const filterClass = document.getElementById("filterClass");
const filterStatus = document.getElementById("filterStatus");
const resetFilterBtn = document.querySelector(".filter-reset-btn");
const pagination = document.getElementById("pagination");
const totalSiswaText = document.getElementById("totalSiswaText");
const layakCount = document.getElementById("layakCount");
const dipertimbangkanCount = document.getElementById("dipertimbangkanCount");
const tidakPrioritasCount = document.getElementById("tidakPrioritasCount");

let currentPage = 1;
const rowsPerPage = 5;
let kelasData = [];
let bantuanData = [];

/* =========================
   DROPDOWN
========================== */

async function renderClassDropdown() {
  try {
    kelasData = await getKelas();

    filterClass.innerHTML = `
      <option value="">
        Semua Kelas
      </option>

      ${kelasData
        .map(
          (item) => `
            <option value="${item.id_kelas || item.id}">
              ${item.nama_kelas || item.name}
            </option>
          `,
        )
        .join("")}
    `;
  } catch (error) {
    console.error("Render kelas dropdown error:", error);
  }
}

/* =========================
   RENDER STATS
========================== */

function renderStats(data) {
  const layakTotal = data.filter(
    (item) => (item.status_bantuan || item.bantuanStatus) === "Layak",
  ).length;
  const dipertimbangkanTotal = data.filter(
    (item) => (item.status_bantuan || item.bantuanStatus) === "Dipertimbangkan",
  ).length;
  const tidakPrioritasTotal = data.filter(
    (item) => (item.status_bantuan || item.bantuanStatus) === "Tidak Prioritas",
  ).length;

  totalSiswaText.textContent = data.length;
  layakCount.textContent = layakTotal;
  dipertimbangkanCount.textContent = dipertimbangkanTotal;
  tidakPrioritasCount.textContent = tidakPrioritasTotal;
}

/* =========================
   RENDER TABLE
========================== */

function renderBantuan(data, hasStudentData) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!hasStudentData) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((student) => {
    tableBody.innerHTML += `
      <tr>
        <td>
          <span class="status-badge badge-info">#${student.ranking}</span>
        </td>
        <td>${student.nama_siswa}</td>
        <td>
          <span class="class-badge class-blue">${student.kelas}</span>
        </td>
        <td>
          <span class="income-badge income-orange">${student.penghasilan_ortu || "-"}</span>
        </td>
        <td>${student.status_rumah || "-"}</td>
        <td>
          <span class="status-badge badge-info">${student.skor_akhir}</span>
        </td>
        <td>
          <span class="status-badge
  ${
    student.status_bantuan === "Layak"
      ? "badge-success"
      : student.status_bantuan === "Dipertimbangkan"
        ? "badge-warning"
        : "badge-danger"
  }
"><span class="status-badge
  ${
    student.status_bantuan === "Layak"
      ? "badge-success"
      : student.status_bantuan === "Dipertimbangkan"
        ? "badge-warning"
        : "badge-danger"
  }
">
            ${student.status_bantuan}
          </span>
        </td>
      </tr>
    `;
  });
}

/* =========================
   PAGINATION
========================== */

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
      filterBantuan();
    });
  });
}

/* =========================
   FILTER SYSTEM
========================== */

function filterBantuan() {
  const keyword = searchInput.value.toLowerCase();
  const selectedClass = Number(filterClass.value);
  const selectedStatus = filterStatus.value;
  const rankingData = bantuanData;

  const filtered = rankingData.filter((student) => {
    const matchSearch = student.nama_siswa.toLowerCase().includes(keyword);
    const matchClass =
      !selectedClass || Number(student.id_kelas) === Number(selectedClass);
    const matchStatus =
      !selectedStatus ||
      (student.status_bantuan || student.bantuanStatus) === selectedStatus;

    return matchSearch && matchClass && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderStats(rankingData);
  renderBantuan(filtered, rankingData.length > 0);
  renderPagination(filtered);
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  filterBantuan();
});

filterClass.addEventListener("change", () => {
  currentPage = 1;
  filterBantuan();
});

filterStatus.addEventListener("change", () => {
  currentPage = 1;
  filterBantuan();
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterClass.value = "";
  filterStatus.value = "";
  currentPage = 1;
  filterBantuan();
});

async function loadSpkBantuan() {
  try {
    const data = await getSpkBantuan();
    // Backward-compatible alias for existing filter/stats usage without changing UI structure.
    bantuanData = (data || []).map((item) => ({
      ...item,
      bantuanStatus: item.status_bantuan ?? item.bantuanStatus,
    }));

    filterBantuan();
  } catch (error) {
    console.error("Load SPK bantuan error:", error);
  }
}

async function initSpkPage() {
  await renderClassDropdown();

  await loadSpkBantuan();
}

initSpkPage();
console.log("SPK Bantuan rendered");
