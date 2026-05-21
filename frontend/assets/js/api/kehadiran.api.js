import apiFetch from "./api.js";

export async function getKehadiran() {
  const response = await apiFetch("/absensi");

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

export async function getTahunAjaran() {
  const response = await apiFetch("/tahun-ajaran");

  return response.data || [];
}

export async function createKehadiran(data) {
  const response = await apiFetch("/absensi", {
    method: "POST",

    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateKehadiran(id, data) {
  const response = await apiFetch(`/absensi/${id}`, {
    method: "PUT",

    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deleteKehadiran(id) {
  const response = await apiFetch(`/absensi/${id}`, {
    method: "DELETE",
  });

  return response.data;
}
