import { useContext, useEffect } from "react";
import { navigate } from "vike/client/router";
import { AuthContext } from "../../src/context/AuthContext";

export default function Page() {
  const auth = useContext(AuthContext);

   useEffect(() => {
    if (!auth?.ready) return;

    const destination = auth?.isAuthenticated ? "/app/upgrade" : "/login";
    navigate(destination, { overwriteLastHistoryEntry: true });
  }, [auth?.isAuthenticated, auth?.ready]);

  return <div className="p-6 text-gray-600">Redirecting...</div>;
}