import { createContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

function safeGetToken() {
  if (typeof window === "undefined") return ""; // ✅ SSR/prerender
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
    // ignore storage errors
  }
}

export function AuthProvider({ children }) {
  // ✅ No localStorage read during SSR
  const [token, setToken] = useState(safeGetToken);
  const [loading, setLoading] = useState(false); // optional
  const isAuthenticated = !!token;

  // Keep axios header in sync (safe on server too)
  useEffect(() => {
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
  }, [token]);

  // --- auth actions ---
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      const newToken = res.data?.token || "";
      setToken(newToken);
      safeSetToken(newToken);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password });
      const newToken = res.data?.token || "";
      setToken(newToken);
      safeSetToken(newToken);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    safeSetToken("");
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
    }),
    [token, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
