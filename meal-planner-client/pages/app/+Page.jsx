import React, { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/app/dashboard");
    }
  }, []);

  return <div className="p-6 text-gray-600">Redirecting to your dashboard...</div>;
}
