export function authGuard() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = window.location.pathname.includes("/pages/")
      ? "../login.html"
      : "./login.html";
  }
}
