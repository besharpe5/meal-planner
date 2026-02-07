import { useEffect, useRef, useState } from "react";
import { Link } from "../components/Link";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import { getMealById, serveMeal } from "../services/mealService";
import { getPlan, servePlanDay, setPlanDayMeal } from "../services/planService";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import { getWeekStartLocal, toISODate, toLocalISODate } from "../utils/date";

function timeAgo(dateString) {
  if (!dateString) return "Never";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Unknown";

  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 365) return `${Math.floor(days / 365)}y ago`;
  if (days >= 30) return `${Math.floor(days / 30)}mo ago`;
  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  if (minutes >= 1) return `${minutes}m ago`;
  return "just now";
}

export default function MealDetail({ mealId }) {
  const pageContext = usePageContext();
  const id = mealId ?? pageContext.routeParams?.id;
  const { addToast } = useToast();

  // Context-aware return (Plan -> Meal -> back to same week)
  const params = new URLSearchParams(pageContext.urlParsed?.searchOriginal || "");
  const fromPlan = params.get("from") === "plan";
  const returnWeek = params.get("week"); // YYYY-MM-DD or null

  const backTo = fromPlan
    ? returnWeek
      ? `/app/plan?week=${returnWeek}`
      : "/app/plan"
    : "/app/dashboard";

  const backLabel = fromPlan ? "← Weekly Plan" : "← Dashboard";

  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serving, setServing] = useState(false);
  const [serveFeedback, setServeFeedback] = useState(false);
  const [planPrompt, setPlanPrompt] = useState(null);
  const [planPromptSaving, setPlanPromptSaving] = useState(false);
  const serveFeedbackTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (serveFeedbackTimerRef.current) {
        clearTimeout(serveFeedbackTimerRef.current);
      }
    };
  }, []);

  const load = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getMealById(id);
      setMeal(data);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Load failed",
        message: "Could not load this meal.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updatePlanForServe = async (servedMeal) => {
    const today = new Date();
    const weekStart = getWeekStartLocal(today);
    const weekStartYMD = toLocalISODate(weekStart);
    const dayDate = toLocalISODate(today);

    const plan = await getPlan(weekStartYMD);
    const day = (plan?.days || []).find((d) => toISODate(d.date) === dayDate);
    if (!day) return;

    const entryType = day.entryType || "none";
    const plannedMealId = typeof day.meal === "object" ? day.meal?._id : day.meal;
    const plannedMealName =
      entryType === "leftovers"
        ? "Leftovers"
        : plannedMealId
        ? "Planned meal"
        : "Planned meal";
    const servedMealName = servedMeal?.name || "Served meal";
    const servedAlready = !!day.servedAt;

    if (entryType === "none") {
      await setPlanDayMeal(plan._id, { dayDate, mealId: servedMeal._id });
      await servePlanDay(plan._id, { dayDate, served: true });
      return;
    }

    if (
      entryType === "meal" &&
      plannedMealId &&
      String(plannedMealId) === String(servedMeal._id)
    ) {
      if (!servedAlready) {
        await servePlanDay(plan._id, { dayDate, served: true });
      }
      return;
    }

    setPlanPrompt({
      planId: plan._id,
      dayDate,
      plannedMealId,
      plannedMealName,
      servedMealId: servedMeal._id,
      servedMealName,
      servedAlready,
    });
  };

  const handlePlanPromptChoice = async (shouldReplace) => {
    if (!planPrompt) return;
    setPlanPromptSaving(true);

    try {
      if (shouldReplace) {
        await setPlanDayMeal(planPrompt.planId, {
          dayDate: planPrompt.dayDate,
          mealId: planPrompt.servedMealId,
        });
      }

      if (!planPrompt.servedAlready) {
        await servePlanDay(planPrompt.planId, {
          dayDate: planPrompt.dayDate,
          served: true,
        });
      }

      addToast({
        type: "success",
        title: shouldReplace ? "Plan updated" : "Plan left as-is",
        message: shouldReplace
          ? "Today's plan was replaced and marked as served."
          : "Today's plan was left unchanged and marked as served.",
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Plan update failed",
        message: err?.message || "Could not update today's plan.",
      });
    } finally {
      setPlanPromptSaving(false);
      setPlanPrompt(null);
    }
  };

  const handleServe = async () => {
    if (!meal?._id) return;

    setServing(true);

    // optimistic update
    const prev = meal;
    setMeal((m) => ({
      ...m,
      timesServed: (m?.timesServed ?? 0) + 1,
      lastServed: new Date().toISOString(),
    }));

    try {
      const updated = await serveMeal(meal._id);
      setMeal(updated);

      try {
        await updatePlanForServe(updated);
      } catch (err) {
        console.error(err);
        addToast({
          type: "error",
          title: "Plan sync failed",
          message: err?.message || "Could not update today's plan.",
        });
      }

      setServeFeedback(true);
      if (serveFeedbackTimerRef.current) {
        clearTimeout(serveFeedbackTimerRef.current);
      }
      serveFeedbackTimerRef.current = setTimeout(() => {
        setServeFeedback(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setMeal(prev);

      addToast({
        type: "error",
        title: "Serve failed",
        message: "Could not update this meal. Please try again.",
      });
    } finally {
      setServing(false);
    }
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/meals/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: meal?.name || "Meal",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        addToast({
          type: "success",
          title: "Link copied",
          message: "Meal link copied to clipboard.",
        });
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Share failed",
        message: "Could not share/copy link.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">Meal not found.</p>
            <button
              className="mt-3 text-blue-700 hover:underline"
              onClick={() => navigate(backTo)}
              type="button"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lastDate = meal.lastServed
    ? new Date(meal.lastServed).toLocaleString()
    : "Never";
  const lastAgo = timeAgo(meal.lastServed);

  const ratingValue =
    typeof meal.rating === "number" ? Math.max(0, Math.min(5, meal.rating)) : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <Link className="text-blue-700 hover:underline" to={backTo}>
            {backLabel}
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={shareLink}
              className="text-sm border rounded-lg px-3 py-2 hover:bg-white"
            >
              Share
            </button>

            <Link
              to={`/app/meals/${meal._id}/edit`}
              className="text-sm bg-slate-600 text-white rounded-lg px-3 py-2 hover:bg-slate-700"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={meal.name}
              className="w-full h-56 object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}

          <div className="p-6">
            <h1 className="text-2xl font-bold">{meal.name}</h1>
            {meal.description ? (
              <p className="text-gray-700 mt-1">{meal.description}</p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 border">
                <div className="text-xs text-gray-500">Rating</div>
                <div className="mt-1">
                  <StarRating value={ratingValue} readOnly size="md" />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 border">
                <div className="text-xs text-gray-500">Served</div>
                <div className="font-semibold">{meal.timesServed ?? 0} times</div>
              </div>

              <div className="rounded-lg bg-gray-50 p-3 border col-span-2">
                <div className="text-xs text-gray-500">Last served</div>
                <div className="font-semibold">{lastDate}</div>
                <div className="text-xs text-gray-500 mt-1">{lastAgo}</div>
              </div>
            </div>

            {meal.notes ? (
              <div className="mt-4">
                <div className="text-sm font-semibold mb-1">Notes</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg border bg-gray-50 p-3">
                  {meal.notes}
                </div>
              </div>
            ) : null}

            <button
              onClick={handleServe}
              disabled={serving}
              className="mt-6 w-full bg-[rgb(127,155,130)] text-white rounded-lg py-3 hover:bg-[rgb(112,140,115)] disabled:opacity-60"
              type="button"
            >
              {serving ? "Serving..." : serveFeedback ? "Served ✓" : "Serve Tonight"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={load}
            className="text-sm text-blue-700 hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {planPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              Update today&apos;s plan?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Today is planned for <span className="font-semibold">{planPrompt.plannedMealName}</span>,
              but you served <span className="font-semibold">{planPrompt.servedMealName}</span>.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => handlePlanPromptChoice(false)}
                disabled={planPromptSaving}
              >
                Serve without changing plan
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                onClick={() => handlePlanPromptChoice(true)}
                disabled={planPromptSaving}
              >
                Replace plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
