import { loginUser } from "../api/auth.api.js";
import { isAuthenticated, setAuthSession } from "../modules/auth.js";
import { showToast } from "../modules/toast.js";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

if (isAuthenticated()) {
  window.location.href = "./index.html";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await loginUser(username, password);
    const token = response?.data?.token || response?.token;

    if (setAuthSession(token)) {
      window.location.href = "./index.html";
      return;
    }

    throw new Error("Token tidak ditemukan pada response login");
  } catch (error) {
    showToast({
      type: "warning",
      title: "Login gagal",
      message: error.message || "Username atau password salah",
    });
  }
});
