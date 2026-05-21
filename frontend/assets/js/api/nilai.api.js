import apiFetch from "./api.js";

export async function getNilai() {
  const response = await apiFetch("/nilai");

  return response.data || [];
}

export async function getWaliKelas() {
  const response = await apiFetch("/guru/wali-kelas");

  return response.data || [];
}

export async function getKelasByWali(id) {
  const response = await apiFetch(`/kelas/by-wali/${id}`);

  return response.data;
}

export async function getStudentsByClass(id) {
  const response = await apiFetch(`/students/by-class/${id}`);

  return response.data || [];
}

export async function getMapel() {
  const response = await apiFetch("/mapel");

  return response.data || [];
}

export async function getSemester() {
  const response = await apiFetch("/semester");

  return response.data || [];
}

export async function getTahunAjaran() {
  const response = await apiFetch("/tahun-ajaran");

  return response.data || [];
}

export async function createNilai(data) {
  const response = await apiFetch("/nilai", {
    method: "POST",

    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateNilai(id, data) {
  const response = await apiFetch(`/nilai/${id}`, {
    method: "PUT",

    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deleteNilai(id) {
  const response = await apiFetch(`/nilai/${id}`, {
    method: "DELETE",
  });

  return response.data;
}
