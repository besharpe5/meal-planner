import React, { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";
import { ToastProvider } from "../src/context/ToastContext";

export default function Wrapper({ children }) {
  useEffect(() => {
    registerSW({ immediate: true });
  }, []);

  return (
    <React.StrictMode>
      <ToastProvider>{children}</ToastProvider>
    </React.StrictMode>
  );
}
