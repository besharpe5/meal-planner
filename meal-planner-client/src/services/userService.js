import API from "./api";

export async function getMe() {
  const res = await API.get("/user/me");
  return res.data;
}

export async function updateEmail(email, currentPassword) {
  const res = await API.put("/user/email", { email, currentPassword });
  return res.data;
}

export async function updatePassword(currentPassword, newPassword) {
  const res = await API.put("/user/password", {
    currentPassword,
    newPassword,
  });
  return res.data;
}

// Family

export async function getFamily() {
  const res = await API.get("/family");
  return res.data;
}

export async function updateFamilyName(name) {
  const res = await API.put("/family/name", { name });
  return res.data;
}

export async function createInvite() {
  const res = await API.post("/family/invite");
  return res.data;
}

export async function getInvites() {
  const res = await API.get("/family/invites");
  return res.data;
}

export async function revokeInvite(code) {
  const res = await API.delete(`/family/invite/${code}`);
  return res.data;
}

export async function getInvitePreview(code) {
  const res = await API.get(`/family/invite/${code}`);
  return res.data;
}

export async function acceptInvite(code, { mergeMeals = false } = {}) {
  const res = await API.post(`/family/invite/${code}/accept`, { mergeMeals });
  return res.data;
}

export async function leaveFamily() {
  const res = await API.post("/family/leave");
  return res.data;
}
