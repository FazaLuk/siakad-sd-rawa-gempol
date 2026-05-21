import {
  createGuru,
  deleteGuru,
  getGuru,
  updateGuru,
} from "../api/guru.api.js";

/* =========================
   STORAGE CONFIG
========================== */

export const GURU_STORAGE_KEY = "guruData";

/* =========================
   LOAD DATA
========================== */

function getStoredGuruData() {
  if (typeof localStorage === "undefined") return [];

  try {
    const storedData = localStorage.getItem(GURU_STORAGE_KEY);

    // kalau belum ada data
    if (!storedData) return [];

    const parsedData = JSON.parse(storedData);

    // pastikan array
    if (!Array.isArray(parsedData)) return [];

    // cleanup legacy field
    const normalizedData = parsedData.map((item) => {
      if (!Object.prototype.hasOwnProperty.call(item, "homeroomClass")) {
        return item;
      }

      const { homeroomClass, ...guruData } = item;

      return guruData;
    });

    // update storage jika ada legacy data
    localStorage.setItem(GURU_STORAGE_KEY, JSON.stringify(normalizedData));

    return normalizedData;
  } catch (error) {
    console.error("Gagal memuat data guru dari localStorage", error);

    return [];
  }
}

/* =========================
   STATE
========================== */

export const guru = getStoredGuruData();

export function syncGuruData(nextGuru) {
  if (!Array.isArray(nextGuru)) return;

  guru.splice(0, guru.length, ...nextGuru);
}

function mapGuruGender(gender) {
  if (gender === "L") return "Laki-laki";
  if (gender === "P") return "Perempuan";

  return gender || "";
}

function mapApiGuruToFrontend(item) {
  if (!item) return null;

  const type = item.jenis_guru ?? item.type ?? item.role ?? "";

  return {
    id: item.id_guru ?? item.id,
    nip: item.nip || "",
    name: item.nama_guru ?? item.name ?? "",
    type,
    role: type,
    subject: item.mapel_diampu ?? item.subject ?? "",
    gender: mapGuruGender(item.jenis_kelamin ?? item.gender),
    phone: item.no_hp_guru ?? item.no_hp ?? item.phone ?? "",
  };
}

export async function loadGuruDataFromApi() {
  const apiGuru = await getGuru();
  const mappedGuru = apiGuru.map(mapApiGuruToFrontend).filter(Boolean);

  syncGuruData(mappedGuru);
  saveGuruData();

  return guru;
}

export async function createGuruToApi(guruData) {
  await createGuru(guruData);

  return await loadGuruDataFromApi();
}

export async function updateGuruToApi(id, guruData) {
  await updateGuru(id, guruData);

  return await loadGuruDataFromApi();
}

export async function deleteGuruFromApi(id) {
  await deleteGuru(id);

  return await loadGuruDataFromApi();
}

/* =========================
   HELPER
========================== */

export function getHomeroomGuruData() {
  return guru.filter(
    (item) =>
      item.type === "Wali Kelas" ||
      item.type === "Wali Kelas & Guru Mata Pelajaran",
  );
}

/* =========================
   SAVE DATA
========================== */

export function saveGuruData() {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(GURU_STORAGE_KEY, JSON.stringify(guru));
  } catch (error) {
    console.error("Gagal menyimpan data guru ke localStorage", error);
  }
}
