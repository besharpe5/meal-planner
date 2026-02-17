// src/context/AuthContext.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import API, { setAccessToken, clearTokens } from "../services/api";

import { AuthContext } from "./authContext";

export { AuthContext } from "./authContext";

/** Check for auth hint in localStorage (SSR-safe) */
function hasAuthFlag() {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem("auth_flag") === "1"; } catch { return false; }
}
function setAuthFlag() {
  try { localStorage.setItem("auth_flag", "1"); } catch { /* ignore */ }
}
function clearAuthFlag() {
  try { localStorage.removeItem("auth_flag"); } catch { /* ignore */ }
}

function storeRefreshToken(token) {
  try {
    if (token) localStorage.setItem("refresh_token", token);
    else localStorage.removeItem("refresh_token");
  } catch { /* ignore */ }
}

function normalizeAxiosError(err, fallback = "Request failed") {
  const status = err?.response?.status;
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;
  const e = new Error(message);
  e.status = status;
  e.raw = err;
  return e;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = ready && !!user;

  /** Hydrate session: fetch /user/me and let the 401 interceptor handle the refresh.
   *  This avoids a race where hydrateSession + the interceptor both call /auth/refresh
   *  concurrently with the same token, triggering reuse detection. */
  const hydrateSession = useCallback(async () => {
    try {
      const rt = localStorage.getItem("refresh_token");
      if (!rt) { setUser(null); return; }

      // Call /user/me — the 401 interceptor will transparently refresh the token
      const res = await API.get("/user/me");
      setUser(res.data);
    } catch {
      setUser(null);
      clearTokens();
      clearAuthFlag();
    }
  }, []);

  // On mount: if auth_flag exists, hydrate session
  useEffect(() => {
    if (hasAuthFlag()) {
      hydrateSession().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [hydrateSession]);

  // Listen for auth:logout events from the API interceptor (refresh failed)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      clearAuthFlag();
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  /** ---------- auth actions ---------- */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      setAccessToken(res.data.accessToken);
      storeRefreshToken(res.data.refreshToken);
      setUser(res.data?.user || null);
      setAuthFlag();
      return res.data;
    } catch (err) {
      throw normalizeAxiosError(err, "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password });
      setAccessToken(res.data.accessToken);
      storeRefreshToken(res.data.refreshToken);
      setUser(res.data?.user || null);
      setAuthFlag();
      return res.data;
    } catch (err) {
      throw normalizeAxiosError(err, "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const rt = (() => { try { return localStorage.getItem("refresh_token"); } catch { return null; } })();
    try {
      await API.post("/auth/logout", { refreshToken: rt });
    } catch {
      // Server may be down — still clear client state
    }
    setUser(null);
    clearTokens();
    clearAuthFlag();
  };

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
    }),
    [user, ready, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
