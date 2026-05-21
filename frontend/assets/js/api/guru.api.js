import apiFetch from "./api.js";

function normalizeGuru(item) {
  if (!item) return null;

  const type = item.jenis_guru ?? item.type ?? item.role ?? "";

  return {
    id: item.id_guru ?? item.id,
    nip: item.nip || "",
    name: item.nama_guru ?? item.name ?? "",
    type,
    role: type,
    subject: item.mapel_diampu ?? item.subject ?? "",
    gender: item.jenis_kelamin ?? item.gender ?? "",
    phone: item.no_hp_guru ?? item.no_hp ?? item.phone ?? "",
  };
}

function toGuruPayload(guru) {
  const roleMap = {
    "Wali Kelas": "Wali Kelas",

    "Guru Mata Pelajaran": "Guru Mata Pelajaran",

    "Wali Kelas & Guru Mata Pelajaran": "Wali Kelas & Guru Mata Pelajaran",
  };

  return {
    nip: guru.nip,

    nama_guru: guru.name,

    jenis_guru: roleMap[guru.type || guru.role] || guru.type || guru.role,

    jenis_kelamin: guru.gender || "",

    mapel_diampu: guru.subject || "",
  };
}
export async function getGuru() {
  const response = await apiFetch("/guru");

  return (response?.data || []).map(normalizeGuru).filter(Boolean);
}

export async function createGuru(guru) {
  const response = await apiFetch("/guru", {
    method: "POST",
    body: JSON.stringify(toGuruPayload(guru)),
  });

  return normalizeGuru(response?.data);
}

export async function updateGuru(id, guru) {
  const response = await apiFetch(`/guru/${id}`, {
    method: "PUT",
    body: JSON.stringify(toGuruPayload(guru)),
  });

  return normalizeGuru(response?.data);
}

export async function deleteGuru(id) {
  return await apiFetch(`/guru/${id}`, {
    method: "DELETE",
  });
}
