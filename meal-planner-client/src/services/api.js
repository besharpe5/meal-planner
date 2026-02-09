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
  withCredentials: true,
});

// ---------- Token management ----------

let _accessToken = null;

export function setAccessToken(token) { _accessToken = token; }
export function getAccessToken() { return _accessToken; }

function getRefreshToken() {
  try { return localStorage.getItem("refresh_token"); } catch { return null; }
}
function setRefreshToken(token) {
  try {
    if (token) localStorage.setItem("refresh_token", token);
    else localStorage.removeItem("refresh_token");
  } catch { /* ignore */ }
}

export function clearTokens() {
  _accessToken = null;
  setRefreshToken(null);
}

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
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
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      isRefreshing = true;

      try {
        const rt = getRefreshToken();
        if (!rt) throw new Error("No refresh token");

        const res = await api.post("/auth/refresh", { refreshToken: rt });

        // Store new tokens
        _accessToken = res.data.accessToken;
        setRefreshToken(res.data.refreshToken);

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearTokens();
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
