import { createContext, useEffect, useMemo, useState } from "react";
import API from "../services/api"; // axios instance with baseURL + interceptor (if you have one)

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null); // optional: set if your backend returns user info
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  // On initial load: if token exists, ensure API has auth header
  useEffect(() => {
    if (token) {
      // If you already do this in services/api.js interceptor, this won't hurt.
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
    setLoading(false);
  }, [token]);

  // Login
  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });

    const newToken = res.data?.token;
    if (!newToken) throw new Error("No token returned from login");

    // ✅ Recommended key: "token" (matches ProtectedRoute)
    localStorage.setItem("token", newToken);
    setToken(newToken);

    // Optional: if backend returns user object, store it
    if (res.data?.user) setUser(res.data.user);

    return res.data;
  };

  // Register
  const register = async (email, password, extra = {}) => {
    // Adjust payload fields if your register route expects more
    const res = await API.post("/auth/register", { email, password, ...extra });

    // Many apps auto-login after register; if yours returns a token, store it
    const newToken = res.data?.token;
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      if (res.data?.user) setUser(res.data.user);
    }

    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    delete API.defaults.headers.common.Authorization;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
