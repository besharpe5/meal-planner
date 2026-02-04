import React, { useContext } from "react";
import { AuthContext } from "../src/context/AuthContext";
import Navbar from "../src/components/Navbar";

/**
 * Layout wraps every page.
 * Use it for global chrome, spacing, and shared UI.
 */
export default function Layout({ children }) {
  const { ready } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Only show Navbar once auth is initialized to avoid flicker */}
      {ready ? <Navbar /> : null}

      {/* Your app pages expect this bottom padding */}
      <div className="pb-20 md:pb-0">{children}</div>
    </div>
  );
}
