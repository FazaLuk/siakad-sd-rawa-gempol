import apiFetch from "./api.js";

export async function loginUser(username, password) {
  return await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}
