import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/authContext";
import { getPlanStatusFromUser } from "./planStatus";

export { getPlanStatusFromUser } from "./planStatus";

export function usePlanStatus() {
  const auth = useContext(AuthContext);
  const user = auth?.user || null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timerId;

    const scheduleNextTick = () => {
      const currentTime = Date.now();
      const nextMidnight = new Date(currentTime);

      nextMidnight.setHours(24, 0, 0, 0);

      const delay = Math.max(1, nextMidnight.getTime() - currentTime);

      timerId = setTimeout(() => {
        setNow(Date.now());
        scheduleNextTick();
      }, delay);
    };

    scheduleNextTick();

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  return useMemo(() => getPlanStatusFromUser(user, now), [user, now]);
}