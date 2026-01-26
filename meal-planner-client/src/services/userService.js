import API from "./api";

export async function getMe() {
  const res = await API.get("/api/user/me");
  return res.data;
}

export async function updateEmail(email, currentPassword) {
  const res = await API.put("/api/user/email", { email, currentPassword });
  return res.data;
}

export async function updatePassword(currentPassword, newPassword) {
  const res = await API.put("/api/user/password", {
    currentPassword,
    newPassword,
  });
  return res.data;
}
