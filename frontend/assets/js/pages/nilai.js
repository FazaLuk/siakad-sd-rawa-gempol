console.log("Nilai page connected");

import {
  getNilai as fetchNilai,
  getWaliKelas,
  getKelasByWali,
  getStudentsByClass,
  getMapel,
  getSemester,
  getTahunAjaran,
  createNilai,
  updateNilai as updateNilaiApi,
  deleteNilai as deleteNilaiApi,
} from "../api/nilai.api.js";

import { getKelas } from "../api/kelas.api.js";
import { showToast } from "../modules/toast.js";

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("nilaiTableBody");
const searchInput = document.getElementById("searchNilai");
const filterClass = document.getElementById("filterClass");
const pagination = document.getElementById("pagination");
const nilaiModal = document.getElementById("nilaiModal");
const nilaiModalTitle = nilaiModal.querySelector(".student-modal-header h3");
const nilaiModalDescription = nilaiModal.querySelector(
  ".student-modal-header p",
);
const openNilaiModal = document.getElementById("openNilaiModal");
const closeModal = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModal = document.getElementById("cancelModal");
const resetFilterBtn = document.querySelector(".filter-reset-btn");

const nilaiStudentId = document.getElementById("nilaiStudentId");
const nilaiStudentSearch = document.getElementById("nilaiStudentSearch");
const nilaiClassName = document.getElementById("nilaiClassName");
const nilaiGuruId = document.getElementById("nilaiGuruId");
const nilaiSubject = document.getElementById("nilaiSubject");
const nilaiTask = document.getElementById("nilaiTask");
const nilaiUts = document.getElementById("nilaiUts");
const nilaiUas = document.getElementById("nilaiUas");
const nilaiAverage = document.getElementById("nilaiAverage");
const saveNilaiBtn = document.getElementById("saveNilaiBtn");
const totalNilaiCard = document.getElementById("totalNilaiCard");
const nilaiTertinggiCard = document.getElementById("nilaiTertinggiCard");
const nilaiTerendahCard = document.getElementById("nilaiTerendahCard");
const rataAkademikCard = document.getElementById("rataAkademikCard");

let currentPage = 1;
let selectedNilaiId = null;
let nilai = [];
let kelasData = [];
let formStudents = [];
let formSubjects = [];
let activeSemester = null;
let activeTahunAjaran = null;
let formDropdownLoaded = false;
const rowsPerPage = 5;

/* =========================
   HELPER
========================== */

function getSelectedHomeroomClass() {
  if (!nilaiClassName.dataset.classId) return null;

  return {
    id_kelas: Number(nilaiClassName.dataset.classId),
    nama_kelas: nilaiClassName.value,
  };
}

function getNilaiStudentName(item) {
  return item.siswa?.nama_siswa || "-";
}

function getNilaiGuruName(item) {
  return item.kelas?.guru?.nama_guru || "-";
}

function getNilaiClassName(item) {
  return item.kelas?.nama_kelas || "-";
}

function isScoreValid(value) {
  const score = Number(value);

  return value !== "" && Number.isFinite(score) && score >= 0 && score <= 100;
}

function getNilaiMapelName(item) {
  return item.mapel?.nama_mapel || "-";
}

function sanitizeScoreInput(input) {
  input.value = input.value.replace(/[^\d.]/g, "");

  const score = Number(input.value);

  if (input.value && score > 100) {
    input.value = "100";
  }
}

function getCurrentAverage() {
  if (
    !isScoreValid(nilaiTask.value) ||
    !isScoreValid(nilaiUts.value) ||
    !isScoreValid(nilaiUas.value)
  ) {
    return "";
  }

  return calculateAverageScore(nilaiTask.value, nilaiUts.value, nilaiUas.value);
}

function updateAveragePreview() {
  nilaiAverage.value = getCurrentAverage();
}

function calculateAverageScore(taskScore, utsScore, uasScore) {
  return (Number(taskScore) + Number(utsScore) + Number(uasScore)) / 3;
}

function getFilteredStudentsBySelectedClass() {
  const selectedKelas = getSelectedHomeroomClass();
  const keyword = nilaiStudentSearch.value.trim().toLowerCase();

  if (!selectedKelas) return [];

  return formStudents.filter((student) =>
    student.nama_siswa.toLowerCase().includes(keyword),
  );
}

function updateSelectedGuruClass() {
  const selectedKelas = getSelectedHomeroomClass();

  nilaiClassName.value = selectedKelas ? selectedKelas.nama_kelas : "";
  nilaiStudentSearch.disabled = !selectedKelas;
  nilaiStudentId.disabled = !selectedKelas;
}

function getAverageScores() {
  return nilai.map((item) => Number(item.rata_rata));
}

function formatScore(value) {
  return Number.isInteger(value) ? value : value.toFixed(1);
}

function renderSummaryCards() {
  const averages = getAverageScores();

  totalNilaiCard.textContent = nilai.length;

  if (!averages.length) {
    nilaiTertinggiCard.textContent = "-";
    nilaiTerendahCard.textContent = "-";
    rataAkademikCard.textContent = "-";
    return;
  }

  const highestScore = Math.max(...averages);
  const lowestScore = Math.min(...averages);
  const academicAverage =
    averages.reduce((total, score) => total + score, 0) / averages.length;

  nilaiTertinggiCard.textContent = formatScore(highestScore);
  nilaiTerendahCard.textContent = formatScore(lowestScore);
  rataAkademikCard.textContent = formatScore(
    Math.round(academicAverage * 10) / 10,
  );
}

/* =========================
   DROPDOWN
========================== */

async function renderFilterDropdowns() {
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
    console.error("Render filter kelas error:", error);
  }
}

function renderStudentDropdown(selectedStudentId = "") {
  const selectedKelas = getSelectedHomeroomClass();
  const filteredStudents = getFilteredStudentsBySelectedClass();

  if (!selectedKelas) {
    nilaiStudentId.innerHTML = `
      <option value="">Pilih wali kelas terlebih dahulu</option>
    `;
    return;
  }

  if (!filteredStudents.length) {
    nilaiStudentId.innerHTML = `
      <option value="">Belum ada data</option>
    `;
    return;
  }

  nilaiStudentId.innerHTML = `
    <option value="">Pilih siswa</option>
    ${filteredStudents
      .map(
        (student) =>
          `<option value="${student.id_siswa}">${student.nama_siswa}</option>`,
      )
      .join("")}
  `;

  nilaiStudentId.value = selectedStudentId;
}

function getSubjectId(subject) {
  return subject.id_mapel || subject.id || subject;
}

function getSubjectName(subject) {
  return subject.nama_mapel || subject.name || subject;
}

function renderSubjectDropdown(subjects = formSubjects, selectedSubject = "") {
  if (!subjects.length) {
    nilaiSubject.innerHTML = `
      <option value="">
        Belum ada mata pelajaran
      </option>
    `;

    nilaiSubject.disabled = true;

    return;
  }

  nilaiSubject.disabled = false;

  nilaiSubject.innerHTML = `
    <option value="">
      Pilih mata pelajaran
    </option>

    ${subjects
      .map(
        (subject) => `
          <option value="${subject.id_mapel}">
            ${subject.nama_mapel}
          </option>
        `,
      )
      .join("")}
  `;

  nilaiSubject.value = selectedSubject;
}

async function renderFormDropdowns() {
  if (formDropdownLoaded) return;
  try {
    const [homeroomGuru, mapelData, semesters, tahunAjaran] = await Promise.all(
      [getWaliKelas(), getMapel(), getSemester(), getTahunAjaran()],
    );

    formSubjects = mapelData;

    activeTahunAjaran =
      tahunAjaran.find((item) => item.aktif) || tahunAjaran[0] || null;

    activeSemester =
      semesters.find(
        (item) =>
          item.aktif &&
          (!activeTahunAjaran ||
            Number(item.id_tahun_ajaran) ===
              Number(activeTahunAjaran.id_tahun_ajaran)),
      ) ||
      semesters.find((item) => item.aktif) ||
      semesters[0] ||
      null;

    if (activeSemester?.id_tahun_ajaran) {
      activeTahunAjaran =
        tahunAjaran.find(
          (item) =>
            Number(item.id_tahun_ajaran) ===
            Number(activeSemester.id_tahun_ajaran),
        ) || activeTahunAjaran;
    }

    nilaiGuruId.innerHTML = `
      <option value="">
        Pilih wali kelas
      </option>

      ${homeroomGuru
        .map((item) => {
          return `
            <option value="${item.id_guru}">

              ${item.nama_guru}

              ${
                item.kelas?.nama_kelas
                  ? ` - Wali Kelas ${item.kelas.nama_kelas}`
                  : ""
              }

            </option>
          `;
        })
        .join("")}
    `;

    nilaiStudentSearch.disabled = true;

    nilaiStudentId.disabled = true;

    nilaiGuruId.disabled = !homeroomGuru.length;

    saveNilaiBtn.disabled =
      !formSubjects.length || !activeSemester || !activeTahunAjaran;

    renderSubjectDropdown(formSubjects);
    formDropdownLoaded = true;
  } catch (error) {
    console.error("Render form dropdown error:", error);
  }
}

/* =========================
   MODAL
========================== */

openNilaiModal.addEventListener("click", () => {
  selectedNilaiId = null;
  setNilaiModalMode("add");
  resetNilaiForm();
  renderFormDropdowns();
  nilaiModal.classList.add("show");
});

function hideModal() {
  nilaiModal.classList.remove("show");
}

function resetNilaiForm() {
  nilaiStudentId.value = "";
  nilaiStudentSearch.value = "";
  nilaiClassName.value = "";
  nilaiClassName.dataset.classId = "";
  nilaiGuruId.value = "";
  nilaiSubject.value = "";
  nilaiTask.value = "";
  nilaiUts.value = "";
  nilaiUas.value = "";
  nilaiAverage.value = "";
  formStudents = [];
}

function setNilaiModalMode(mode) {
  if (mode === "edit") {
    nilaiModalTitle.textContent = "Edit Nilai";
    nilaiModalDescription.textContent = "Ubah data nilai siswa";
    saveNilaiBtn.textContent = "Simpan Perubahan";
    return;
  }

  nilaiModalTitle.textContent = "Tambah Nilai";
  nilaiModalDescription.textContent = "Tambahkan data nilai siswa";
  saveNilaiBtn.textContent = "Simpan Nilai";
}

async function fillNilaiForm(selectedNilai) {
  const waliKelasId =
    selectedNilai.kelas?.id_wali_kelas || selectedNilai.kelas?.guru?.id_guru;

  nilaiGuruId.value = waliKelasId || "";
  nilaiStudentSearch.value = "";

  if (waliKelasId) {
    const selectedKelas = await getKelasByWali(waliKelasId);

    nilaiClassName.value = selectedKelas?.nama_kelas || "";
    nilaiClassName.dataset.classId = selectedKelas?.id_kelas || "";

    formStudents = selectedKelas?.id_kelas
      ? await getStudentsByClass(selectedKelas.id_kelas)
      : [];
  }

  updateSelectedGuruClass();
  renderStudentDropdown(selectedNilai.id_siswa);
  renderSubjectDropdown(formSubjects, selectedNilai.id_mapel);
  nilaiTask.value = selectedNilai.tugas;
  nilaiUts.value = selectedNilai.uts;
  nilaiUas.value = selectedNilai.uas;
  updateAveragePreview();
}

closeModal.addEventListener("click", hideModal);
closeModalBtn.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);

nilaiGuruId.addEventListener("change", async () => {
  nilaiStudentSearch.value = "";

  nilaiStudentId.value = "";

  const guruId = nilaiGuruId.value;

  if (!guruId) return;

  const kelas = await getKelasByWali(guruId);

  nilaiClassName.value = kelas?.nama_kelas || "";
  nilaiClassName.dataset.classId = kelas?.id_kelas || "";

  if (kelas?.id_kelas) {
    formStudents = await getStudentsByClass(kelas.id_kelas);
  } else {
    formStudents = [];
  }

  nilaiStudentId.disabled = false;

  nilaiStudentSearch.disabled = false;

  renderStudentDropdown();
});

nilaiStudentSearch.addEventListener("input", () => {
  renderStudentDropdown();
});

[nilaiTask, nilaiUts, nilaiUas].forEach((input) => {
  input.addEventListener("input", () => {
    sanitizeScoreInput(input);
    updateAveragePreview();
  });
});

/* =========================
   SAVE NILAI
========================== */

saveNilaiBtn.addEventListener("click", async () => {
  const selectedStudent = formStudents.find(
    (student) => Number(student.id_siswa) === Number(nilaiStudentId.value),
  );
  const selectedKelas = getSelectedHomeroomClass();
  const classId = selectedKelas ? selectedKelas.id_kelas : null;
  const selectedMapel = nilaiSubject.value;

  if (
    !selectedStudent ||
    !classId ||
    !nilaiSubject.value ||
    !selectedMapel ||
    !activeSemester ||
    !activeTahunAjaran ||
    !nilaiTask.value ||
    !nilaiUts.value ||
    !nilaiUas.value
  ) {
    showToast({
      type: "error",
      title: "Data belum lengkap",
      message:
        "Siswa, kelas, guru, mapel, nilai tugas, UTS, dan UAS wajib diisi.",
    });

    return;
  }

  if (Number(selectedStudent.id_kelas) !== Number(classId)) {
    showToast({
      type: "warning",
      title: "Siswa tidak sesuai kelas",
      message: "Pilih siswa dari kelas wali yang sedang dipilih.",
    });

    return;
  }

  if (
    !isScoreValid(nilaiTask.value) ||
    !isScoreValid(nilaiUts.value) ||
    !isScoreValid(nilaiUas.value)
  ) {
    showToast({
      type: "warning",
      title: "Nilai tidak valid",
      message: "Nilai tugas, UTS, dan UAS harus berada di rentang 0 - 100.",
    });

    return;
  }

  const nilaiData = {
    id_siswa: Number(selectedStudent.id_siswa),
    id_kelas: Number(classId),
    id_mapel: Number(nilaiSubject.value),
    id_semester: Number(activeSemester.id_semester),
    id_tahun_ajaran: Number(activeTahunAjaran.id_tahun_ajaran),
    tugas: Number(nilaiTask.value),
    uts: Number(nilaiUts.value),
    uas: Number(nilaiUas.value),
  };

  const isEditMode = Boolean(selectedNilaiId);

  try {
    if (isEditMode) {
      await updateNilaiApi(selectedNilaiId, nilaiData);
    } else {
      await createNilai(nilaiData);
      currentPage = 1;
    }

    await loadNilai();
    hideModal();

    selectedNilaiId = null;
    setNilaiModalMode("add");
    resetNilaiForm();

    showToast({
      type: "success",
      title: isEditMode
        ? "Data nilai diperbarui"
        : "Nilai berhasil ditambahkan",
      message: `${selectedStudent.nama_siswa} sudah tersimpan di tabel nilai.`,
    });
  } catch (error) {
    const message = error.message || "Data nilai gagal disimpan.";
    const isDuplicate =
      message.toLowerCase().includes("duplikat") ||
      message.toLowerCase().includes("sudah ada") ||
      message.toLowerCase().includes("unique");

    showToast({
      type: isDuplicate ? "warning" : "error",
      title: isDuplicate ? "Nilai duplikat" : "Data nilai gagal disimpan",
      message: isDuplicate
        ? "Nilai siswa untuk mata pelajaran ini sudah ada"
        : message,
    });
  }
});

/* =========================
   RENDER TABLE
========================== */

function renderNilai(data) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((item, index) => {
    const averageScore = Number(item.rata_rata);

    tableBody.innerHTML += `
      <tr>
        <td>${start + index + 1}</td>
        <td>
          <div class="student-avatar">
            <i class="bi bi-journal-check"></i>
          </div>
        </td>
        <td>${getNilaiStudentName(item)}</td>
        <td>
          <span class="class-badge class-blue">${getNilaiClassName(item)}</span>
        </td>
        <td>${getNilaiGuruName(item)}</td>
        <td>${getNilaiMapelName(item)}</td>
        <td>${item.tugas}</td>
        <td>${item.uts}</td>
        <td>${item.uas}</td>
        <td>
          <span class="status-badge badge-success">${formatScore(averageScore)}</span>
        </td>
        <td>
          <div class="table-action">
            <button class="action-btn btn-edit" data-id="${item.id_nilai}" type="button">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="action-btn btn-delete" data-id="${item.id_nilai}" type="button">
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
      filterNilai();
    });
  });
}

/* =========================
   SEARCH & FILTER
========================== */

searchInput.addEventListener("keyup", () => {
  currentPage = 1;
  filterNilai();
});

filterClass.addEventListener("change", () => {
  currentPage = 1;
  filterNilai();
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterClass.value = "";
  currentPage = 1;
  filterNilai();
});

function filterNilai() {
  const keyword = searchInput.value.toLowerCase();
  const selectedClass = Number(filterClass.value);

  const filtered = nilai.filter((item) => {
    const studentName = getNilaiStudentName(item).toLowerCase();
    const guruName = getNilaiGuruName(item).toLowerCase();
    const className = getNilaiClassName(item).toLowerCase();
    const subject = getNilaiMapelName(item).toLowerCase();

    const matchSearch =
      studentName.includes(keyword) ||
      guruName.includes(keyword) ||
      className.includes(keyword) ||
      subject.includes(keyword);

    const matchClass =
      !selectedClass || Number(item.id_kelas) === Number(selectedClass);

    return matchSearch && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderNilai(filtered);
  renderPagination(filtered);
}

/* =========================
   ACTION
========================== */

tableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest(".btn-edit");
  const deleteButton = event.target.closest(".btn-delete");

  if (editButton) {
    editNilai(Number(editButton.dataset.id));
    return;
  }

  if (!deleteButton) return;

  deleteNilai(Number(deleteButton.dataset.id));
});

async function editNilai(id) {
  const selectedNilai = nilai.find((item) => item.id_nilai === id);

  if (!selectedNilai) return;

  selectedNilaiId = id;
  setNilaiModalMode("edit");
  await renderFormDropdowns();
  await fillNilaiForm(selectedNilai);
  nilaiModal.classList.add("show");
}

function deleteNilai(id) {
  const nilaiIndex = nilai.findIndex((item) => item.id_nilai === id);

  if (nilaiIndex === -1) return;

  const selectedNilai = nilai[nilaiIndex];

  showToast({
    type: "delete",
    title: "Hapus data nilai?",
    message: `Nilai ${getNilaiStudentName(selectedNilai)} akan dihapus dari tabel.`,
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
          const currentIndex = nilai.findIndex((item) => item.id_nilai === id);

          if (currentIndex === -1) return;

          try {
            await deleteNilaiApi(id);
            await loadNilai();

            showToast({
              type: "success",
              title: "Data nilai dihapus",
              message: "Data nilai berhasil dihapus dari tabel.",
            });
          } catch (error) {
            showToast({
              type: "error",
              title: "Data nilai gagal dihapus",
              message: error.message || "Data nilai gagal dihapus.",
            });
          }
        },
      },
    ],
  });
}

async function loadNilai() {
  try {
    nilai = await fetchNilai();
  } catch (error) {
    console.error("Load nilai error:", error);
    nilai = [];

    showToast({
      type: "error",
      title: "Data nilai gagal dimuat",
      message: error.message || "Data nilai gagal dimuat dari server.",
    });
  }

  renderSummaryCards();
  filterNilai();
}

async function initNilaiPage() {
  await renderFormDropdowns();

  await loadNilai();

  renderFilterDropdowns();
}

initNilaiPage();

console.log("Nilai rendered");
