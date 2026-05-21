import apiFetch from "./api.js";

const BASE_URL = "http://localhost:3000/api";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.append(key, value);
    }
  });

  return query.toString();
}

async function getReportRows(endpoint, params = {}) {
  const query = buildQuery(params);
  const suffix = query ? `?${query}` : "";
  const response = await apiFetch(`/reports/${endpoint}${suffix}`);

  return response?.data?.rows || [];
}

export function getGradesReport(params) {
  return getReportRows("grades", params);
}

export function getAttendanceReport(params) {
  return getReportRows("attendance", params);
}

export function getStudentsReport(params) {
  return getReportRows("students", params);
}

export function getSpkReport(params) {
  return getReportRows("spk", params);
}

const exportEndpointMap = {
  nilai: "grades",
  kehadiran: "attendance",
  siswa: "students",
  bantuan: "spk",
};

export async function downloadReportExport(reportType, params = {}, format = "xlsx") {
  const endpoint = exportEndpointMap[reportType];

  if (!endpoint) {
    throw new Error("Jenis export laporan tidak dikenali");
  }

  const token = localStorage.getItem("token");
  const query = buildQuery({ ...params, format });
  const response = await fetch(
    `${BASE_URL}/reports/export/${endpoint}?${query}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = window.location.pathname.includes("/pages/")
      ? "../login.html"
      : "./login.html";
    return null;
  }

  if (!response.ok) {
    let message = "Export laporan gagal";

    try {
      const errorData = await response.json();
      message = errorData?.message || errorData?.error || message;
    } catch (error) {
      // ignore json parse error
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
  const fileName = fileNameMatch?.[1] || `laporan.${format === "pdf" ? "pdf" : "xlsx"}`;

  return { blob, fileName };
}
