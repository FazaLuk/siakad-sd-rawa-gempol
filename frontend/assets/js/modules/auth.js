/* =========================
   SIMPLE AUTH SESSION
========================== */

export const AUTH_STORAGE_KEY = "siakad_auth";
const AUTH_SESSION_VALUE = "logged_in";
export const AUTH_TOKEN_KEY = "token";

function getLoginPath() {
  return window.location.pathname.includes("/pages/")
    ? "../login.html"
    : "./login.html";
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

export function setAuthSession(token) {
  if (!token) return false;

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_STORAGE_KEY, AUTH_SESSION_VALUE);
  return true;
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = getLoginPath();
}

export function requireAuth() {
  if (isAuthenticated()) return;

  window.location.href = getLoginPath();
}

export function initAuthControls() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", logout);
  });
}
