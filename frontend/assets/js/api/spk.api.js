import apiFetch from "./api.js";

export async function getSpkBantuan() {
  const response = await apiFetch("/spk-bantuan");

  return response.data || [];
}
