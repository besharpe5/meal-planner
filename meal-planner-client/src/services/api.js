import axios from "axios";

function normalizeBaseUrl(url) {
  if (!url) return ""; // will break loudly if env missing
  return url.replace(/\/+$/, ""); // remove trailing slash(es)
}

const RAW = normalizeBaseUrl(import.meta.env.VITE_API_URL);

// If VITE_API_URL already ends with /api, don't add it again
const baseURL = RAW.endsWith("/api") ? RAW : `${RAW}/api`;

const api = axios.create({
  baseURL,
  withCredentials: false,
});

// Attach Bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers = config.headers ?? {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

export default api;
