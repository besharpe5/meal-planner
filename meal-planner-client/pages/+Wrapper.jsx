import "../src/index.css"; // ensures CSS is bundled
import React, { useEffect } from "react";
import { ToastProvider } from "../src/context/ToastContext";

export default function Wrapper({ children }) {
  useEffect(() => {
    // Client-only: avoid any chance of SSR/bundler weirdness
    if (typeof window === "undefined") return;

    (async () => {
      const { registerSW } = await import("virtual:pwa-register");
      registerSW({ immediate: true });
    })();
  }, []);

  return (
    <React.StrictMode>
      <ToastProvider>{children}</ToastProvider>
    </React.StrictMode>
  );
}
