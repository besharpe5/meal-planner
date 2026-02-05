import React, { useEffect } from "react";
import { navigate } from "vike/client/router";

export default function Page() {
  useEffect(() => {
    navigate("/app/dashboard", { overwriteLastHistoryEntry: true });
  }, []);

  return <div className="p-6 text-gray-600">Redirecting to your dashboard...</div>;
}