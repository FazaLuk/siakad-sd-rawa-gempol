import apiFetch from "./api.js";

function normalizeStudent(student) {
  if (!student) return null;

  const className = student.kelas?.nama_kelas || student.class || "";

  return {
    id: student.id_siswa ?? student.id,
    nisn: student.nisn || "",
    name: student.nama_siswa ?? student.name ?? "",
    classId: student.id_kelas ?? student.classId ?? "",
    class: className,
    gender: student.jenis_kelamin ?? student.gender ?? "",
    parent: student.nama_ortu ?? student.parent ?? "",
    income: student.penghasilan_ortu ?? student.income ?? "",
    house: student.status_rumah ?? student.house ?? "",
    phone: student.no_hp_ortu ?? student.phone ?? "",
    birthDate:
      student.tanggal_lahir?.slice?.(0, 10) ??
      student.birthDate ??
      "2000-01-01",
  };
}

function toStudentPayload(student) {
  const genderMap = {
    "Laki-laki": "L",
    Perempuan: "P",
  };

  const incomeMap = {
    "< 1 Juta": "<1jt",
    "1 - 2 Juta": "1jt-2jt",
    "2 - 3 Juta": "2jt-3jt",
    "> 3 Juta": ">3jt",
  };

  return {
    nisn: student.nisn,
    nama_siswa: student.name,

    jenis_kelamin: genderMap[student.gender] || student.gender,

    tanggal_lahir: student.birthDate || "2000-01-01",

    nama_ortu: student.parent || "-",

    penghasilan_ortu: incomeMap[student.income] || student.income || "-",

    status_rumah: student.house || "-",

    no_hp_ortu: student.phone || "",

    id_kelas: Number(student.classId),
  };
}

export async function getStudents() {
  const response = await apiFetch("/students");

  return (response?.data || []).map(normalizeStudent);
}

export async function getStudentById(id) {
  const response = await apiFetch(`/students/${id}`);

  return normalizeStudent(response?.data);
}

export async function createStudent(student) {
  const response = await apiFetch("/students", {
    method: "POST",
    body: JSON.stringify(toStudentPayload(student)),
  });

  return normalizeStudent(response?.data);
}

export async function updateStudent(id, student) {
  const response = await apiFetch(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(toStudentPayload(student)),
  });

  return normalizeStudent(response?.data);
}

export async function deleteStudent(id) {
  return await apiFetch(`/students/${id}`, {
    method: "DELETE",
  });
}
