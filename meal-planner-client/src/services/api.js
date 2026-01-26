import axios from "axios";

// IMPORTANT: Vercel uses env vars set in Vercel project settings.
// Locally, Vite reads from .env.local (must start with VITE_)
const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5001";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  // If you are NOT using cookies, you can leave this false.
  // Keeping true is OK, but requires server CORS credentials settings.
  withCredentials: false,
});

// Attach Bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
