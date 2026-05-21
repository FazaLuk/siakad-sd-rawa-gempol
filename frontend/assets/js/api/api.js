const BASE_URL = "http://localhost:3000/api";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && endpoint !== "/auth/login") {
    localStorage.removeItem("token");
    window.location.href = window.location.pathname.includes("/pages/")
      ? "../login.html"
      : "./login.html";
    return;
  }

  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Terjadi kesalahan");
  }

  return data;
}

export default apiFetch;
