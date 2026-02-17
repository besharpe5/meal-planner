// pages/app/+Layout.jsx
import React from "react";
import { AuthProvider } from "../../src/context/AuthContext";
import { ToastProvider } from "../../src/context/ToastContext";
import Navbar from "../../src/components/Navbar";
import TrialStatusBanner from "../../src/components/TrialStatusBanner";

export default function Layout({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Navbar />
        <TrialStatusBanner />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
