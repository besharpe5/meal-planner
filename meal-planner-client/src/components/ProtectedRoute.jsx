import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { ready, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!ready) return null;

  if (!isAuthenticated) {
    const next = encodeURIComponent("/app" + location.pathname + location.search);
    window.location.replace(`/login?next=${next}`);
    return null;
  }

  return children;
}
