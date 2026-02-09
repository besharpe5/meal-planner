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
  withCredentials: true, // send httpOnly cookies cross-origin
});

// ---------- Silent refresh on 401 ----------

let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh or logout calls themselves
    if (
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Another refresh is in-flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Broadcast auth failure so AuthContext can react
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
