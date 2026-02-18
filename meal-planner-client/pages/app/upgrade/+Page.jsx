import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../../../src/context/AuthContext";
import { Link } from "../../../src/components/Link";
import API from "../../../src/services/api";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getPlanDetails(user) {
  if (!user) return { planLabel: "Free", trialDaysLeft: 0 };

  const isTrialActive =
    user.isPremium &&
    user.premiumSource === "trial" &&
    !user.hasEverPaid &&
    user.premiumExpiresAt &&
    new Date(user.premiumExpiresAt) > new Date();

  if (isTrialActive) {
    const trialDaysLeft = Math.max(
      0,
      Math.ceil((new Date(user.premiumExpiresAt) - new Date()) / MS_PER_DAY)
    );
    return { planLabel: "Free Trial", trialDaysLeft };
  }

  if (user.isPremium) return { planLabel: "Premium", trialDaysLeft: 0 };
  return { planLabel: "Free", trialDaysLeft: 0 };
}

export default function Page() {
  const auth = useContext(AuthContext);
  const user = auth?.user || null;

  const [activePlan, setActivePlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { planLabel, trialDaysLeft } = useMemo(() => getPlanDetails(user), [user]);
  const isPaidPremium = !!(user?.isPremium && user?.premiumSource !== "trial");

  const backHref = auth?.isAuthenticated ? "/app/dashboard" : "/";
  const ctaHref = auth?.isAuthenticated ? null : "/login";

  const startCheckout = async (plan) => {
    setErrorMessage("");
    setActivePlan(plan);

    try {
      const res = await API.post("/billing/create-checkout-session", { plan });
      const checkoutUrl = res?.data?.url;

      if (!checkoutUrl) {
        throw new Error("No checkout URL returned.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      const message = err?.response?.data?.message || "Could not start checkout right now.";
      setErrorMessage(message);
      setActivePlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8f6] text-slate-800">
      <div className="mx-auto max-w-3xl px-5 py-14">
        <a href={backHref} className="text-sm text-slate-600 hover:text-[rgb(127,155,130)] hover:underline">
          ← {auth?.isAuthenticated ? "Back to dashboard" : "Back to home"}
        </a>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-white px-2.5 py-1 shadow-sm">Current plan: {planLabel}</span>
          {trialDaysLeft > 0 && (
            <span className="rounded-full bg-[#e7f3ea] px-2.5 py-1 text-emerald-700 shadow-sm">
              {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in trial
            </span>
          )}
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Make dinner decisions once. Eat well. Move on.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          One subscription covers your entire household with unlimited meals, smart weekly planning, and a complete meal history that keeps everything organized.
        </p>

        {isPaidPremium && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Your account already has an active premium subscription.
          </div>
        )}

        <section className="mt-10 rounded-2xl border-2 border-[rgb(127,155,130)] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[rgb(127,155,130)]">Annual Plan</p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-4xl font-bold text-slate-900">$69</p>
            <p className="pb-1 text-base text-slate-600">/ year</p>
          </div>
          <p className="mt-4 text-slate-700">
            Most families choose annual for uninterrupted planning and built-in savings.
          </p>

          <ul className="mt-6 space-y-2 text-sm leading-relaxed text-slate-700 sm:text-base">
            <li>✔ Unlimited meals for your entire household</li>
            <li>✔ One shared system for everyone</li>
            <li>✔ Smart weekly planning with personalized suggestions</li>
            <li>✔ Complete meal history &amp; rotation memory</li>
            <li>✔ Priority access to new features</li>
          </ul>

          {ctaHref ? (
            <Link
              to={ctaHref}
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[rgb(127,155,130)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[rgb(112,140,115)]"
            >
              Start Annual Plan
            </Link>
          ) : (
            <button
              type="button"
              disabled={!!activePlan || isPaidPremium}
              onClick={() => startCheckout("annual")}
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[rgb(127,155,130)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[rgb(112,140,115)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activePlan === "annual" ? "Starting checkout..." : "Start Annual Plan"}
            </button>
          )}
          <p className="mt-3 text-center text-xs text-slate-500">Billed once yearly. Cancel anytime.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
          <p className="text-sm font-medium text-slate-600">Prefer to pay monthly?</p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-2xl font-semibold text-slate-900">$7.99</p>
            <p className="pb-0.5 text-sm text-slate-600">/ month</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">Same features. Cancel anytime.</p>

          {ctaHref ? (
            <Link
              to={ctaHref}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Start Monthly Plan
            </Link>
          ) : (
            <button
              type="button"
              disabled={!!activePlan || isPaidPremium}
              onClick={() => startCheckout("monthly")}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activePlan === "monthly" ? "Starting checkout..." : "Start Monthly Plan"}
            </button>
          )}
        </section>

        {errorMessage && <p className="mt-4 text-sm text-red-600">{errorMessage}</p>}
      </div>
    </main>
  );
}