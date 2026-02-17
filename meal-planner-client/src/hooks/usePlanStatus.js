import { useContext, useMemo } from "react";
import { AuthContext } from "../context/authContext";
import { getPlanStatusFromUser } from "./planStatus";

export { getPlanStatusFromUser } from "./planStatus";

export function usePlanStatus() {
  const auth = useContext(AuthContext);
  const user = auth?.user || null;

  return useMemo(() => getPlanStatusFromUser(user), [user]);
}