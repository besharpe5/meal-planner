import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Wrap routes like /login and /register so authed users bounce into the app.
 */
export default function PublicOnlyRoute({ redirectTo = "/app/dashboard" }) {
  const { ready, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!ready) return null;

  if (isAuthenticated) {
    // If someone manually hits /login while authed, ignore ?next and just go in.
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
