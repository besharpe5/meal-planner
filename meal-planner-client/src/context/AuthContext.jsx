// src/context/AuthContext.jsx
import { createContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

function safeGetToken() {
  if (typeof window === "undefined") return ""; // SSR/prerender safety
  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

function safeSetToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  } catch {
    // ignore storage errors (private mode, etc.)
  }
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
  // No localStorage reads during SSR (safeGetToken handles it)
  const [token, setToken] = useState(safeGetToken);
  const [user, setUser] = useState(null); // optional; keep if you later return user info
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  // Optional: keep axios default header in sync (interceptor already does this; harmless redundancy)
  useEffect(() => {
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });

      const newToken = res.data?.token;

      // ✅ Fail loudly instead of setting empty token (prevents redirect flicker loops)
      if (!newToken || typeof newToken !== "string") {
        console.error("Invalid login response:", res.status, res.data);
        throw new Error("Login failed: no token returned.");
      }

      setToken(newToken);
      safeSetToken(newToken);

      // Optional: if backend returns user, store it
      if (res.data?.user) setUser(res.data.user);

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

      const newToken = res.data?.token;

      if (!newToken || typeof newToken !== "string") {
        console.error("Invalid register response:", res.status, res.data);
        throw new Error("Registration failed: no token returned.");
      }

      setToken(newToken);
      safeSetToken(newToken);

      if (res.data?.user) setUser(res.data.user);

      return res.data;
    } catch (err) {
      throw normalizeAxiosError(err, "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    safeSetToken("");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
    }),
    [token, user, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
