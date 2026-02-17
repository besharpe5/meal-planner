import { useState } from "react";
import { Link } from "./Link";
import { usePlanStatus } from "../hooks/usePlanStatus";

export default function UpgradePrompt({
  trigger,
  title,
  description,
  ctaText = "Upgrade to Premium",
  variant = "banner",
  upgradeHref = "/upgrade",
  onDismiss,
}) {
  
  const [dismissed, setDismissed] = useState(false);

  const { planLabel, trialDaysLeft } = usePlanStatus();

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof onDismiss === "function") onDismiss({ trigger });
  };

  const content = (
    <div className="w-full rounded-2xl border border-[#dce6de] bg-[#f8fbf8] p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
        <span className="rounded-full bg-white px-2.5 py-1">Current plan: {planLabel}</span>
        {trialDaysLeft > 0 && (
          <span className="rounded-full bg-[#e7f3ea] px-2.5 py-1 text-emerald-700">
            {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in trial
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-700">{description}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={handleDismiss}
          className="order-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:order-1"
        >
          Maybe Later
        </button>
        <Link
          to={upgradeHref}
          className="order-1 inline-flex items-center justify-center rounded-lg bg-[rgb(127,155,130)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgb(112,140,115)] sm:order-2"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-3 sm:items-center sm:justify-center sm:p-4">
        <div className="w-full max-w-lg" role="dialog" aria-modal="true" aria-label={title}>
          {content}
        </div>
      </div>
    );
  }

  return <div data-trigger={trigger}>{content}</div>;
}