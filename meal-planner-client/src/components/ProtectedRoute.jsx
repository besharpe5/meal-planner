import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { ready, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  // Wait until AuthContext decides whether a token exists
  if (!ready) return null;

  if (!isAuthenticated) {
    const next = encodeURIComponent(
      "/app" + location.pathname + location.search
    );
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return children;
}
