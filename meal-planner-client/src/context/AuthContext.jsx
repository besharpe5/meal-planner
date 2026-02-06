// src/context/AuthContext.jsx
import { createContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);


/** ---------- storage helpers (SSR-safe) ---------- */
function safeGetToken() {
  if (typeof window === "undefined") return ""; // SSR/prerender safety
  try {
    const t = localStorage.getItem("token") || "";
    // Guard against common "truthy garbage" values that cause redirect loops
    if (t === "undefined" || t === "null") return "";
    return t;
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
  /**
   * IMPORTANT:
   * - token starts empty
   * - ready becomes true AFTER we read localStorage on the client
   * - route guards must NOT redirect until ready === true
   */
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Optional: if your backend returns user info later
  const [user, setUser] = useState(null);

  // ✅ initialize auth exactly once on client
  useEffect(() => {
    const t = safeGetToken();
    setToken(t);
    setReady(true);
  }, []);

  const isAuthenticated = ready && !!token;

  // Optional: keep axios default header in sync (interceptor may already do this)
  useEffect(() => {
    if (!ready) return;
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
  }, [ready, token]);

  /** ---------- auth actions ---------- */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });

      const newToken = res.data?.token;

      // ✅ fail loudly (prevents silent redirect/flicker loops)
      if (!newToken || typeof newToken !== "string") {
        console.error("Invalid login response:", res.status, res.data);
        throw new Error("Login failed: no token returned.");
      }

      setToken(newToken);
      safeSetToken(newToken);

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
      ready, // ✅ use this in route guards to prevent redirect loops
      isAuthenticated,
      loading,
      login,
      register,
      logout,
    }),
    [token, user, ready, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
