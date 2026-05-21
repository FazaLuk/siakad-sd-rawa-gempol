import { loginUser } from "./api/auth.api.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await loginUser(username, password);

    const token = response?.data?.token || response?.token;

    if (!token) {
      throw new Error("Token tidak ditemukan pada response login");
    }

    localStorage.setItem("token", token);

    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  }
});
