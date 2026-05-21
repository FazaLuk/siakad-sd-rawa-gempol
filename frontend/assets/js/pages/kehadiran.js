import {
  getKehadiran as fetchKehadiran,
  getWaliKelas,
  getKelasByWali,
  getStudentsByClass,
  getTahunAjaran,
  createKehadiran,
  updateKehadiran as updateKehadiranApi,
  deleteKehadiran as deleteKehadiranApi,
} from "../api/kehadiran.api.js";
import { showToast } from "../modules/toast.js";

console.log("Kehadiran page connected");

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("kehadiranTableBody");
const searchInput = document.getElementById("searchKehadiran");
const filterClass = document.getElementById("filterClass");
const filterStatus = document.getElementById("filterStatus");
const resetFilterBtn = document.querySelector(".filter-reset-btn");
const pagination = document.getElementById("pagination");
const kehadiranModal = document.getElementById("kehadiranModal");
const kehadiranModalTitle = kehadiranModal.querySelector(
  ".student-modal-header h3"
);
const kehadiranModalDescription = kehadiranModal.querySelector(
  ".student-modal-header p"
);
const openKehadiranModal = document.getElementById("openKehadiranModal");
const closeModal = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModal = document.getElementById("cancelModal");

const kehadiranClassId = document.getElementById("kehadiranClassId");
const kehadiranStudentSearch = document.getElementById("kehadiranStudentSearch");
const kehadiranStudentId = document.getElementById("kehadiranStudentId");
const kehadiranDate = document.getElementById("kehadiranDate");
const kehadiranStatus = document.getElementById("kehadiranStatus");
const saveKehadiranBtn = document.getElementById("saveKehadiranBtn");
const totalAbsensiCard = document.getElementById("totalAbsensiCard");
const hadirHariIniCard = document.getElementById("hadirHariIniCard");
const izinSakitCard = document.getElementById("izinSakitCard");
const alphaCard = document.getElementById("alphaCard");

let currentPage = 1;
let selectedKehadiranId = null;
let kehadiran = [];
let waliKelasData = [];
let kelasData = [];
let formStudents = [];
let activeTahunAjaran = null;
const rowsPerPage = 5;

/* =========================
   HELPER
========================== */

function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStudentById(studentId) {
  return formStudents.find(
    (student) => Number(student.id_siswa) === Number(studentId)
  );
}

function getKelasById(classId) {
  return kelasData.find((item) => Number(item.id_kelas) === Number(classId));
}

function getKehadiranStudent(item) {
  return item.siswa;
}

function getKehadiranKelas(item) {
  return item.siswa?.kelas || getKelasById(item.id_kelas);
}

function getKehadiranStudentName(item) {
  return getKehadiranStudent(item)?.nama_siswa || "-";
}

function getKehadiranClassName(item) {
  return getKehadiranKelas(item)?.nama_kelas || "-";
}

function getKehadiranClassId(item) {
  return item.siswa?.id_kelas || item.siswa?.kelas?.id_kelas || item.id_kelas;
}

function getKehadiranId(item) {
  return item.id_absensi;
}

function formatKehadiranDate(value) {
  if (!value) return "";

  return String(value).slice(0, 10);
}

function getSelectedGuruId() {
  return Number(kehadiranClassId.value);
}

async function loadStudentsBySelectedWali(selectedStudentId = "") {
  const guruId = getSelectedGuruId();

  formStudents = [];

  if (!guruId) {
    renderStudentDropdown(selectedStudentId);
    return null;
  }

  const selectedKelas = await getKelasByWali(guruId);

  if (selectedKelas && !kelasData.some((item) => item.id_kelas === selectedKelas.id_kelas)) {
    kelasData.push(selectedKelas);
  }

  formStudents = selectedKelas?.id_kelas
    ? await getStudentsByClass(selectedKelas.id_kelas)
    : [];

  renderStudentDropdown(selectedStudentId);

  return selectedKelas;
}

function getStatusBadgeClass(status) {
  const statusMap = {
    Hadir: "badge-success",
    Izin: "badge-warning",
    Sakit: "badge-info",
    Alpha: "badge-danger",
  };

  return statusMap[status] || "badge-warning";
}

function getFilteredStudentsBySelectedClass() {
  const keyword = kehadiranStudentSearch.value.trim().toLowerCase();

  if (!getSelectedGuruId()) return [];

  return formStudents.filter((student) =>
    student.nama_siswa.toLowerCase().includes(keyword)
  );
}

function updateStudentControlState() {
  const hasSelectedClass = Boolean(kehadiranClassId.value);

  kehadiranStudentSearch.disabled = !hasSelectedClass;
  kehadiranStudentId.disabled = !hasSelectedClass;
}

function renderSummaryCards() {
  const today = getTodayDate();
  const presentToday = kehadiran.filter(
    (item) => formatKehadiranDate(item.tanggal) === today && item.status === "Hadir"
  ).length;
  const permissionOrSick = kehadiran.filter(
    (item) => item.status === "Izin" || item.status === "Sakit"
  ).length;
  const absent = kehadiran.filter((item) => item.status === "Alpha").length;

  totalAbsensiCard.textContent = kehadiran.length;
  hadirHariIniCard.textContent = presentToday;
  izinSakitCard.textContent = permissionOrSick;
  alphaCard.textContent = absent;
}

/* =========================
   DROPDOWN
========================== */

async function renderClassDropdowns() {
  try {
    waliKelasData = await getWaliKelas();
    kelasData = waliKelasData.map((item) => item.kelas).filter(Boolean);

    const classOptions = kelasData
      .map(
        (item) => `<option value="${item.id_kelas}">${item.nama_kelas}</option>`
      )
      .join("");

    filterClass.innerHTML = `
      <option value="">Semua Kelas</option>
      ${classOptions}
    `;

    const waliOptions = waliKelasData
      .map(
        (item) => `
          <option value="${item.id_guru}">
            ${item.nama_guru}${
              item.kelas?.nama_kelas ? ` - Wali Kelas ${item.kelas.nama_kelas}` : ""
            }
          </option>
        `
      )
      .join("");

    kehadiranClassId.innerHTML = `
      <option value="">Pilih kelas</option>
      ${waliOptions}
    `;
  } catch (error) {
    console.error("Render kelas absensi error:", error);

    showToast({
      type: "error",
      title: "Data kelas gagal dimuat",
      message: error.message || "Data kelas gagal dimuat dari server.",
    });
  }
}

function renderStudentDropdown(selectedStudentId = "") {
  const filteredStudents = getFilteredStudentsBySelectedClass();

  if (!getSelectedGuruId()) {
    kehadiranStudentId.innerHTML = `
      <option value="">Pilih kelas terlebih dahulu</option>
    `;
    return;
  }

  if (!filteredStudents.length) {
    kehadiranStudentId.innerHTML = `
      <option value="">Belum ada data</option>
    `;
    return;
  }

  kehadiranStudentId.innerHTML = `
    <option value="">Pilih siswa</option>
    ${filteredStudents
      .map(
        (student) =>
          `<option value="${student.id_siswa}">${student.nama_siswa}</option>`
      )
      .join("")}
  `;
  kehadiranStudentId.value = selectedStudentId;
}

/* =========================
   MODAL
========================== */

openKehadiranModal.addEventListener("click", () => {
  selectedKehadiranId = null;
  setKehadiranModalMode("add");
  resetKehadiranForm();
  updateStudentControlState();
  renderStudentDropdown();
  kehadiranModal.classList.add("show");
});

function hideModal() {
  kehadiranModal.classList.remove("show");
}

function resetKehadiranForm() {
  kehadiranClassId.value = "";
  kehadiranStudentSearch.value = "";
  kehadiranStudentId.value = "";
  kehadiranDate.value = getTodayDate();
  kehadiranStatus.value = "";
  formStudents = [];
}

function setKehadiranModalMode(mode) {
  if (mode === "edit") {
    kehadiranModalTitle.textContent = "Edit Absensi";
    kehadiranModalDescription.textContent = "Ubah data kehadiran siswa";
    saveKehadiranBtn.textContent = "Simpan Perubahan";
    return;
  }

  kehadiranModalTitle.textContent = "Tambah Absensi";
  kehadiranModalDescription.textContent = "Tambahkan data kehadiran siswa";
  saveKehadiranBtn.textContent = "Simpan Absensi";
}

async function fillKehadiranForm(selectedKehadiran) {
  kehadiranClassId.value = selectedKehadiran.id_guru;
  kehadiranStudentSearch.value = "";
  updateStudentControlState();
  await loadStudentsBySelectedWali(selectedKehadiran.id_siswa);
  kehadiranDate.value = formatKehadiranDate(selectedKehadiran.tanggal);
  kehadiranStatus.value = selectedKehadiran.status;
}

closeModal.addEventListener("click", hideModal);
closeModalBtn.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);

kehadiranClassId.addEventListener("change", async () => {
  kehadiranStudentSearch.value = "";
  kehadiranStudentId.value = "";
  updateStudentControlState();
  await loadStudentsBySelectedWali();
});

kehadiranStudentSearch.addEventListener("input", () => {
  renderStudentDropdown();
});

/* =========================
   SAVE KEHADIRAN
========================== */

saveKehadiranBtn.addEventListener("click", async () => {
  const selectedStudent = getStudentById(kehadiranStudentId.value);
  const selectedClass = selectedStudent ? getKelasById(selectedStudent.id_kelas) : null;
  const selectedGuruId = getSelectedGuruId();

  if (
    !selectedGuruId ||
    !selectedClass ||
    !selectedStudent ||
    !activeTahunAjaran ||
    !kehadiranDate.value ||
    !kehadiranStatus.value
  ) {
    showToast({
      type: "error",
      title: "Data belum lengkap",
      message: "Kelas, siswa, tanggal, dan status kehadiran wajib diisi.",
    });

    return;
  }

  if (Number(selectedStudent.id_kelas) !== Number(selectedClass.id_kelas)) {
    showToast({
      type: "warning",
      title: "Siswa tidak sesuai kelas",
      message: "Pilih siswa dari kelas yang sedang dipilih.",
    });

    return;
  }

  const kehadiranData = {
    id_siswa: Number(selectedStudent.id_siswa),
    id_guru: selectedGuruId,
    id_tahun_ajaran: Number(activeTahunAjaran.id_tahun_ajaran),
    tanggal: kehadiranDate.value,
    status: kehadiranStatus.value,
  };

  const isEditMode = Boolean(selectedKehadiranId);

  try {
    if (isEditMode) {
      await updateKehadiranApi(selectedKehadiranId, kehadiranData);
    } else {
      await createKehadiran(kehadiranData);
      currentPage = 1;
    }

    await loadKehadiran();
    hideModal();

    selectedKehadiranId = null;
    setKehadiranModalMode("add");
    resetKehadiranForm();

    showToast({
      type: "success",
      title: isEditMode ? "Absensi diperbarui" : "Absensi berhasil ditambahkan",
      message: `${selectedStudent.nama_siswa} sudah tersimpan di tabel kehadiran.`,
    });
  } catch (error) {
    const message = error.message || "Data absensi gagal disimpan.";
    const isDuplicate =
      message.toLowerCase().includes("duplikat") ||
      message.toLowerCase().includes("sudah ada") ||
      message.toLowerCase().includes("unique");

    showToast({
      type: isDuplicate ? "warning" : "error",
      title: isDuplicate ? "Absensi duplikat" : "Data absensi gagal disimpan",
      message: isDuplicate
        ? "Absensi siswa untuk tanggal ini sudah ada"
        : message,
    });
  }
});

/* =========================
   RENDER TABLE
========================== */

function renderKehadiran(data) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((item, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${start + index + 1}</td>
        <td>
          <div class="student-avatar">
            <i class="bi bi-calendar-check-fill"></i>
          </div>
        </td>
        <td>${getKehadiranStudentName(item)}</td>
        <td>
          <span class="class-badge class-blue">${getKehadiranClassName(item)}</span>
        </td>
        <td>${formatKehadiranDate(item.tanggal)}</td>
        <td>
          <span class="status-badge ${getStatusBadgeClass(item.status)}">
            ${item.status}
          </span>
        </td>
        <td>
          <div class="table-action">
            <button class="action-btn btn-edit" data-id="${getKehadiranId(item)}" type="button">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="action-btn btn-delete" data-id="${getKehadiranId(item)}" type="button">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
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
      filterKehadiran();
    });
  });
}

/* =========================
   SEARCH & FILTER
========================== */

searchInput.addEventListener("keyup", () => {
  currentPage = 1;
  filterKehadiran();
});

filterClass.addEventListener("change", () => {
  currentPage = 1;
  filterKehadiran();
});

filterStatus.addEventListener("change", () => {
  currentPage = 1;
  filterKehadiran();
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterClass.value = "";
  filterStatus.value = "";
  currentPage = 1;
  filterKehadiran();
});

function filterKehadiran() {
  const keyword = searchInput.value.toLowerCase();
  const selectedClass = Number(filterClass.value);
  const selectedStatus = filterStatus.value;

  const filtered = kehadiran.filter((item) => {
    const studentName = getKehadiranStudentName(item).toLowerCase();
    const className = getKehadiranClassName(item).toLowerCase();

    const matchSearch =
      studentName.includes(keyword) ||
      className.includes(keyword) ||
      formatKehadiranDate(item.tanggal).includes(keyword) ||
      item.status.toLowerCase().includes(keyword);

    const matchClass =
      !selectedClass || Number(getKehadiranClassId(item)) === selectedClass;
    const matchStatus = !selectedStatus || item.status === selectedStatus;

    return matchSearch && matchClass && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderKehadiran(filtered);
  renderPagination(filtered);
}

/* =========================
   ACTION
========================== */

tableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest(".btn-edit");
  const deleteButton = event.target.closest(".btn-delete");

  if (editButton) {
    editKehadiran(Number(editButton.dataset.id));
    return;
  }

  if (!deleteButton) return;

  deleteKehadiran(Number(deleteButton.dataset.id));
});

async function editKehadiran(id) {
  const selectedKehadiran = kehadiran.find(
    (item) => Number(getKehadiranId(item)) === Number(id)
  );

  if (!selectedKehadiran) return;

  selectedKehadiranId = id;
  setKehadiranModalMode("edit");
  await fillKehadiranForm(selectedKehadiran);
  kehadiranModal.classList.add("show");
}

function deleteKehadiran(id) {
  const kehadiranIndex = kehadiran.findIndex(
    (item) => Number(getKehadiranId(item)) === Number(id)
  );

  if (kehadiranIndex === -1) return;

  const selectedKehadiran = kehadiran[kehadiranIndex];

  showToast({
    type: "delete",
    title: "Hapus data absensi?",
    message: `Absensi ${getKehadiranStudentName(selectedKehadiran)} akan dihapus dari tabel.`,
    duration: 0,
    actions: [
      {
        label: "Batal",
        variant: "secondary",
      },
      {
        label: "Hapus",
        variant: "primary",
        onClick: async () => {
          const currentIndex = kehadiran.findIndex(
            (item) => Number(getKehadiranId(item)) === Number(id)
          );

          if (currentIndex === -1) return;

          try {
            await deleteKehadiranApi(id);
            await loadKehadiran();

            showToast({
              type: "success",
              title: "Data absensi dihapus",
              message: "Data absensi berhasil dihapus dari tabel.",
            });
          } catch (error) {
            showToast({
              type: "error",
              title: "Data absensi gagal dihapus",
              message: error.message || "Data absensi gagal dihapus.",
            });
          }
        },
      },
    ],
  });
}

async function loadTahunAjaran() {
  const tahunAjaran = await getTahunAjaran();

  activeTahunAjaran =
    tahunAjaran.find((item) => item.aktif) || tahunAjaran[0] || null;
}

async function loadKehadiran() {
  try {
    kehadiran = await fetchKehadiran();
  } catch (error) {
    console.error("Load absensi error:", error);
    kehadiran = [];

    showToast({
      type: "error",
      title: "Data absensi gagal dimuat",
      message: error.message || "Data absensi gagal dimuat dari server.",
    });
  }

  renderSummaryCards();
  filterKehadiran();
}

async function initKehadiranPage() {
  await renderClassDropdowns();

  await loadTahunAjaran();

  updateStudentControlState();

  renderStudentDropdown();

  await loadKehadiran();
}

initKehadiranPage();
console.log("Kehadiran rendered");
