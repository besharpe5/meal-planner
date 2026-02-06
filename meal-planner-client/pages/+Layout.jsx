import React from "react";
import { AuthProvider } from "../../src/context/AuthContext";
import { ToastProvider } from "../../src/context/ToastContext";
import Navbar from "../../src/components/Navbar";

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
