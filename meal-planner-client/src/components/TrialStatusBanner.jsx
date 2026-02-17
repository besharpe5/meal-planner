import { useMemo, useState } from "react";
import { usePlanStatus } from "../hooks/usePlanStatus";
import { Link } from "./Link";

const DISMISS_KEY = "trial_status_banner_dismissed";

export default function TrialStatusBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;

    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const { hasTrialHistory, isTrialActive, trialDaysLeft, isTrialExpired } = usePlanStatus();

  const message = useMemo(() => {
    if (!hasTrialHistory) return "";
    if (isTrialActive) {
      return trialDaysLeft <= 1 ? "Your trial ends today" : `Premium trial: ${trialDaysLeft} days left`;
    }
    if (isTrialExpired) {
      return "Your trial has ended. Upgrade to keep Premium features.";
    }
    return "";
  }, [hasTrialHistory, isTrialActive, trialDaysLeft, isTrialExpired]);

  const handleDismiss = () => {
    setDismissed(true);

    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage failures
    }
  };

  if (!message || dismissed) return null;

  return (
    <div className="border-b border-indigo-200 bg-indigo-50/90 px-3 py-2 text-indigo-950 sm:px-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-sm">
        <p className="mr-auto font-medium">{message}</p>
        <Link
          to="/app/upgrade"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 sm:text-sm"
        >
          Upgrade
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss trial banner"
          className="rounded-md px-2 py-1 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100 hover:text-indigo-900 sm:text-sm"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}