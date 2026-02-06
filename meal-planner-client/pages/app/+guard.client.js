// pages/app/+guard.client.js
export async function guard() {
  const token = localStorage.getItem("token");
  if (!token) return "/login";
}
