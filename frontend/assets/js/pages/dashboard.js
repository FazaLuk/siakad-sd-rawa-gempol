import { renderStudentChart } from "../components/charts.js";
import {
  students,
  STUDENT_STORAGE_KEY,
  STUDENT_DATA_CHANGED_EVENT,
  countStudentsByClassId,
  syncStudentData,
  syncStudentDataFromStorageValue,
} from "../modules/students.js";
import { guru, getHomeroomGuruData } from "../modules/guru.js";
import { kelas, getActiveKelasData } from "../modules/kelas.js";

console.log("Dashboard page connected");

const totalStudents = document.getElementById("totalStudents");
const totalGuru = document.getElementById("totalGuru");
const totalActiveKelas = document.getElementById("totalActiveKelas");
const totalHomeroomGuru = document.getElementById("totalHomeroomGuru");
const maleStudents = document.getElementById("maleStudents");
const femaleStudents = document.getElementById("femaleStudents");

function setTextContent(element, value) {
  if (!element) return;

  element.textContent = value;
}

function getStudentGenderCount(gender) {
  return students.filter((student) => student.gender === gender).length;
}

function getStudentsByClass() {
  if (!kelas.length) {
    return {
      labels: [],
      data: [],
    };
  }

  return {
    labels: kelas.map((item) => item.name),
    data: kelas.map((item) => countStudentsByClassId(students, kelas, item.id)),
  };
}

function renderDashboard() {
  const activeKelas = getActiveKelasData();
  const homeroomGuru = getHomeroomGuruData();
  const maleStudentCount = getStudentGenderCount("Laki-laki");
  const femaleStudentCount = getStudentGenderCount("Perempuan");
  const studentClassChart = getStudentsByClass();

  setTextContent(totalStudents, students.length);
  setTextContent(totalGuru, guru.length);
  setTextContent(totalActiveKelas, activeKelas.length);
  setTextContent(totalHomeroomGuru, homeroomGuru.length);
  setTextContent(maleStudents, maleStudentCount);
  setTextContent(femaleStudents, femaleStudentCount);

  renderStudentChart(studentClassChart.labels, studentClassChart.data);
}

function handleStudentDataChange(nextStudents) {
  syncStudentData(nextStudents);
  renderDashboard();
}

window.addEventListener("storage", (event) => {
  if (event.key !== STUDENT_STORAGE_KEY) return;

  syncStudentDataFromStorageValue(event.newValue);
  renderDashboard();
});

window.addEventListener(STUDENT_DATA_CHANGED_EVENT, (event) => {
  handleStudentDataChange(event.detail?.students);
});

renderDashboard();
