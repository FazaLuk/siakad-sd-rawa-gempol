import {
  createKelas,
  deleteKelas,
  getKelas,
  updateKelas,
} from "../api/kelas.api.js";

/* =========================
   STORAGE CONFIG
========================== */

export const KELAS_STORAGE_KEY = "kelasData";

/* =========================
   LOAD DATA
========================== */

function getStoredKelasData() {
  if (typeof localStorage === "undefined") return [];

  try {
    const storedData = localStorage.getItem(KELAS_STORAGE_KEY);

    // kalau belum ada data
    if (!storedData) return [];

    const parsedData = JSON.parse(storedData);

    // pastikan array
    if (!Array.isArray(parsedData)) return [];

    return parsedData;
  } catch (error) {
    console.error("Gagal memuat data kelas dari localStorage", error);

    return [];
  }
}

/* =========================
   STATE
========================== */

export const kelas = getStoredKelasData();

export function syncKelasData(nextKelas) {
  if (!Array.isArray(nextKelas)) return;

  kelas.splice(0, kelas.length, ...nextKelas);
}

function getKelasLabel(name, level) {
  const normalizedName = String(name || "");
  const normalizedLevel = String(level || "");

  if (normalizedName.startsWith(normalizedLevel)) {
    return normalizedName.slice(normalizedLevel.length) || normalizedName;
  }

  return normalizedName;
}

function mapApiKelasToFrontend(item) {
  if (!item) return null;

  const name = item.nama_kelas ?? item.name ?? "";
  const level = String(item.tingkat ?? item.level ?? "");

  return {
    id: item.id_kelas ?? item.id,
    name,
    level,
    label: item.label ?? getKelasLabel(name, level),
    guruId: item.id_wali_kelas ?? item.guruId ?? "",
    homeroomTeacher: item.guru?.nama_guru ?? item.homeroomTeacher ?? "",
    status: item.status ?? "Aktif",
  };
}

export async function loadKelasDataFromApi() {
  const apiKelas = await getKelas();
  const mappedKelas = apiKelas.map(mapApiKelasToFrontend).filter(Boolean);

  syncKelasData(mappedKelas);
  saveKelasData();

  return kelas;
}

export async function createKelasToApi(kelasData) {
  await createKelas(kelasData);

  return await loadKelasDataFromApi();
}

export async function updateKelasToApi(id, kelasData) {
  await updateKelas(id, kelasData);

  return await loadKelasDataFromApi();
}

export async function deleteKelasFromApi(id) {
  await deleteKelas(id);

  return await loadKelasDataFromApi();
}

/* =========================
   HELPER
========================== */

export function getActiveKelasData() {
  return kelas.filter((item) => item.status === "Aktif");
}

/* =========================
   SAVE DATA
========================== */

export function saveKelasData() {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(KELAS_STORAGE_KEY, JSON.stringify(kelas));
  } catch (error) {
    console.error("Gagal menyimpan data kelas ke localStorage", error);
  }
}
