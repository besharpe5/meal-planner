// src/context/AuthContext.jsx
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

/** Check for the non-httpOnly auth_flag cookie (SSR-safe) */
function hasAuthFlag() {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("auth_flag");
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

  /** Hydrate user from /me if auth_flag cookie present */
  const fetchUser = useCallback(async () => {
    try {
      const res = await API.get("/user/me");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  // On mount: if auth_flag exists, hydrate user state from server
  useEffect(() => {
    if (hasAuthFlag()) {
      fetchUser().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [fetchUser]);

  // Listen for auth:logout events from the API interceptor (refresh failed)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  /** ---------- auth actions ---------- */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      setUser(res.data?.user || null);
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
      setUser(res.data?.user || null);
      return res.data;
    } catch (err) {
      throw normalizeAxiosError(err, "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // Server may be down — still clear client state
    }
    setUser(null);
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
      fetchUser,
    }),
    [user, ready, isAuthenticated, loading, fetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
