import { createContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const isBrowser = typeof window !== "undefined";

  const [token, setToken] = useState(() => {
    if (!isBrowser) return ""; // prerender/SSR
    return localStorage.getItem("token") || "";
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  useEffect(() => {
    // During prerender, this effect won't run anyway; still safe.
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
    setLoading(false);
  }, [token]);

  // ...rest of your AuthProvider (login/register/logout) unchanged...

  const value = useMemo(
    () => ({
      token,
      setToken,
      user,
      setUser,
      loading,
      isAuthenticated,
      // include your login/register/logout functions here too
    }),
    [token, user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
