import apiFetch from "./api.js";

function getKelasLevel(value) {
  if (!value) return "";

  const normalizedValue = String(value);

  return normalizedValue.startsWith("Kelas ")
    ? normalizedValue
    : `Kelas ${normalizedValue}`;
}

function getKelasLabel(name, level) {
  const normalizedName = String(name || "");
  const normalizedLevel = String(level || "");

  if (normalizedName.startsWith(normalizedLevel)) {
    return normalizedName.slice(normalizedLevel.length) || normalizedName;
  }

  return normalizedName;
}

function normalizeKelas(item) {
  if (!item) return null;

  const name = item.nama_kelas ?? item.name ?? "";
  const level = getKelasLevel(item.tingkat ?? item.level ?? item.grade);

  return {
    id: item.id_kelas ?? item.id,
    name,
    level,
    grade: level,
    label: item.label ?? getKelasLabel(name, level),
    guruId: item.id_wali_kelas ?? item.guruId ?? item.homeroomTeacherId ?? "",
    homeroomTeacherId:
      item.id_wali_kelas ?? item.guruId ?? item.homeroomTeacherId ?? "",
    homeroomTeacher: item.guru?.nama_guru ?? item.homeroomTeacher ?? "",
    status: item.status ?? "Aktif",
  };
}

function toKelasPayload(kelas) {
  const levelNumber = String(kelas.level || kelas.grade || "").replace(/\D/g, "");

  return {
    nama_kelas: kelas.name,
    tingkat: Number(levelNumber),
    id_wali_kelas: Number(kelas.guruId ?? kelas.homeroomTeacherId),
  };
}

export async function getKelas() {
  const response = await apiFetch("/kelas");

  return (response?.data || []).map(normalizeKelas).filter(Boolean);
}

export async function createKelas(kelas) {
  const response = await apiFetch("/kelas", {
    method: "POST",
    body: JSON.stringify(toKelasPayload(kelas)),
  });

  return normalizeKelas(response?.data);
}

export async function updateKelas(id, kelas) {
  const response = await apiFetch(`/kelas/${id}`, {
    method: "PUT",
    body: JSON.stringify(toKelasPayload(kelas)),
  });

  return normalizeKelas(response?.data);
}

export async function deleteKelas(id) {
  return await apiFetch(`/kelas/${id}`, {
    method: "DELETE",
  });
}
