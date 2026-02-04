// pages/+Wrapper.jsx
import "../src/index.css"; // ensures CSS is bundled
import React, { useEffect } from "react";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";

/**
 * Wrapper runs for every Vike page.
 * Keep it client-safe and avoid doing anything that can interfere with routing.
 */
export default function Wrapper({ children }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only register SW in production builds.
    // This prevents "stale cache / wrong HTML" issues during staging/debug.
    const isProd = import.meta.env.PROD;

    if (!isProd) return;

    // Register after first paint to reduce chance of SW fighting initial navigation.
    const id = window.setTimeout(async () => {
      try {
        const { registerSW } = await import("virtual:pwa-register");
        registerSW({
          immediate: false,
          onRegistered(swUrl, r) {
            // optional: console.debug("SW registered:", swUrl);
          },
          onRegisterError(err) {
            console.warn("SW registration error:", err);
          },
        });
      } catch (err) {
        console.warn("SW import failed:", err);
      }
    }, 250);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <React.StrictMode>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </React.StrictMode>
  );
}
