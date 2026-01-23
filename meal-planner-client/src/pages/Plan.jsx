// src/pages/Plan.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { getMeals, serveMeal } from "../services/mealService";
import { getPlan, setPlanDayMeal } from "../services/planService";
import StarRating from "../components/StarRating";

function parseISODateLocal(iso) {
  // iso: "YYYY-MM-DD" -> local midnight (avoids UTC shift bugs)
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Monday-based week start (stable across timezones)
function getWeekStartLocal(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Convert Sun(0)..Sat(6) to Mon(0)..Sun(6)
  const day = (d.getDay() + 6) % 7;

  d.setDate(d.getDate() - day); // back to Monday
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = addDays(start, 6);
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(
    undefined,
    opts
  )}`;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** ---------- Suggestions helpers ---------- */

function daysSince(dateString) {
  if (!dateString) return Number.POSITIVE_INFINITY; // never served = highest priority
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return Number.POSITIVE_INFINITY;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getPlannedMealIds(plan) {
  const set = new Set();
  (plan?.days || []).forEach((day) => {
    if (day?.meal?._id) set.add(day.meal._id);
  });
  return set;
}

function suggestMeal({ meals, excludeMealIds = new Set() }) {
  if (!meals?.length) return null;

  // Score: higher = more recommended
  // - Never served => huge score
  // - Older lastServed => higher score
  // - Higher rating => small boost
  const scored = meals
    .filter((m) => !excludeMealIds.has(m._id))
    .map((m) => {
      const ds = daysSince(m.lastServed); // Infinity if never served
      const rating = typeof m.rating === "number" ? m.rating : 0;

      const recencyScore = ds === Infinity ? 10000 : ds;
      const ratingScore = rating * 2;

      return { meal: m, score: recencyScore + ratingScore };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.meal || null;
}

/** ---------- UI constants ---------- */

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Plan() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [savingDay, setSavingDay] = useState(null); // dayIndex
  const [servingDay, setServingDay] = useState(null);
  const [fillingWeek, setFillingWeek] = useState(false);

  // Initialize week from URL (?week=YYYY-MM-DD) or default to current week.
  // Parse the ISO date as LOCAL time to avoid timezone shifting.
  const [weekStart, setWeekStart] = useState(() => {
    const weekParam = searchParams.get("week");
    if (!weekParam) return getWeekStartLocal(new Date());

    const d = parseISODateLocal(weekParam);
    if (Number.isNaN(d.getTime())) return getWeekStartLocal(new Date());

    return getWeekStartLocal(d); // normalize to Monday
  });

  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
  const todayISO = useMemo(() => toISODate(new Date()), []);

  // Keep URL normalized to the Monday of the week
  useEffect(() => {
    const urlWeek = searchParams.get("week");
    const normalized = weekStartISO;

    if (!urlWeek) {
      navigate(`/plan?week=${normalized}`, { replace: true });
      return;
    }

    if (urlWeek !== normalized) {
      navigate(`/plan?week=${normalized}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartISO]);

  const load = async () => {
    setLoading(true);
    try {
      const [mealsData, planData] = await Promise.all([
        getMeals(),
        getPlan(weekStartISO),
      ]);
      setMeals(mealsData);
      setPlan(planData);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Planner failed to load",
        message: "Could not load meals and plan.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartISO]);

  const onPickMeal = async (dayIndex, mealId) => {
    if (!plan?._id) return;

    setSavingDay(dayIndex);

    // optimistic update
    const prev = plan;
    const chosenMeal = meals.find((m) => m._id === mealId) || null;

    const next = {
      ...plan,
      days: plan.days.map((d, i) => (i === dayIndex ? { ...d, meal: chosenMeal } : d)),
    };
    setPlan(next);

    try {
      const updated = await setPlanDayMeal(plan._id, dayIndex, mealId || null);
      setPlan(updated);

      addToast({
        type: "success",
        title: "Plan updated",
        message: `Saved ${DAY_NAMES[dayIndex]}.`,
        duration: 1400,
      });
    } catch (err) {
      console.error(err);
      setPlan(prev);
      addToast({
        type: "error",
        title: "Save failed",
        message: "Could not update that day.",
      });
    } finally {
      setSavingDay(null);
    }
  };

  const onServeFromPlan = async (dayIndex) => {
    const meal = plan?.days?.[dayIndex]?.meal;
    const mealId = meal?._id;
    if (!mealId) return;

    // Prevent double serve in the same day
    if (meal?.lastServed && isSameDay(meal.lastServed, new Date())) {
      addToast({
        type: "info",
        title: "Already served today",
        message: "This meal was marked served today already.",
        duration: 2200,
      });
      return;
    }

    setServingDay(dayIndex);

    try {
      await serveMeal(mealId);
      addToast({
        type: "success",
        title: "Served tonight",
        message: "Meal served count updated.",
      });

      // Reload so lastServed/timesServed reflects immediately
      await load();
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Serve failed",
        message: "Could not mark served.",
      });
    } finally {
      setServingDay(null);
    }
  };

  /** ---------- Suggestion handlers ---------- */

  const suggestForDay = async (dayIndex) => {
    if (!plan?._id) return;

    // exclude meals already planned this week (nice UX)
    const plannedIds = getPlannedMealIds(plan);

    // allow reusing the one already on this day (so "Suggest" can swap freely)
    const currentMealId = plan?.days?.[dayIndex]?.meal?._id;
    if (currentMealId) plannedIds.delete(currentMealId);

    const suggested = suggestMeal({ meals, excludeMealIds: plannedIds });

    if (!suggested) {
      addToast({
        type: "info",
        title: "No suggestion",
        message: "No meals available to suggest.",
      });
      return;
    }

    await onPickMeal(dayIndex, suggested._id);

    const ds = daysSince(suggested.lastServed);
    const reason =
      ds === Infinity ? "Never served" : `Last served ${ds} day${ds === 1 ? "" : "s"} ago`;

    addToast({
      type: "success",
      title: "Suggested meal",
      message: `${DAY_NAMES[dayIndex]}: ${suggested.name} • ${reason}`,
      duration: 2200,
    });
  };

  const fillWeekWithSuggestions = async () => {
    if (!plan?._id || fillingWeek) return;

    setFillingWeek(true);

    try {
      // Avoid duplicates while filling
      const used = new Set(getPlannedMealIds(plan));

      for (let i = 0; i < 7; i++) {
        // Skip days with a meal already
        if (plan.days?.[i]?.meal?._id) continue;

        const suggested = suggestMeal({ meals, excludeMealIds: used });
        if (!suggested) break;

        used.add(suggested._id);
        // eslint-disable-next-line no-await-in-loop
        await onPickMeal(i, suggested._id);
      }

      addToast({
        type: "success",
        title: "Week filled",
        message: "Suggestions added to open days.",
        duration: 2000,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Fill week failed",
        message: "Could not fill the week with suggestions.",
      });
    } finally {
      setFillingWeek(false);
    }
  };

  /** ---------- Week navigation ---------- */

  const goPrevWeek = () => {
    const next = addDays(weekStart, -7);
    setWeekStart(next);
    navigate(`/plan?week=${toISODate(next)}`);
  };

  const goNextWeek = () => {
    const next = addDays(weekStart, 7);
    setWeekStart(next);
    navigate(`/plan?week=${toISODate(next)}`);
  };

  const goThisWeek = () => {
    const monday = getWeekStartLocal(new Date());
    setWeekStart(monday);
    navigate(`/plan?week=${toISODate(monday)}`);
  };

  /** ---------- Render ---------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6">Loading…</div>
        </div>
      </div>
    );
  }

  // Empty-state if no meals exist yet
  if (!meals.length) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Weekly Plan</h1>
              <p className="text-sm text-gray-600">{formatWeekRange(weekStart)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-1">No meals yet</h2>
            <p className="text-gray-700 mb-4">
              Add a few meals first, then you can plan your week in seconds.
            </p>
            <Link
              to="/meals/new"
              className="inline-block bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              + Add your first meal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl font-bold">Weekly Plan</h1>
            <p className="text-sm text-gray-600">{formatWeekRange(weekStart)}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={goPrevWeek}
              className="border rounded-lg px-3 py-2 text-sm hover:bg-white"
              type="button"
            >
              ← Prev
            </button>

            <button
              onClick={goThisWeek}
              className="border rounded-lg px-3 py-2 text-sm hover:bg-white"
              type="button"
            >
              This week
            </button>

            <button
              onClick={goNextWeek}
              className="border rounded-lg px-3 py-2 text-sm hover:bg-white"
              type="button"
            >
              Next →
            </button>

            <button
              onClick={fillWeekWithSuggestions}
              className="border rounded-lg px-3 py-2 text-sm hover:bg-white disabled:opacity-60"
              type="button"
              disabled={fillingWeek}
            >
              {fillingWeek ? "Filling..." : "Fill week"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="divide-y">
            {plan?.days?.map((day, idx) => {
              const dateISO = toISODate(day.date);
              const isToday = dateISO === todayISO;

              const dateStr = new Date(day.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              });

              const selectedId = day.meal?._id || "";
              const meal = day.meal;

              const ratingValue =
                typeof meal?.rating === "number" ? Math.max(0, Math.min(5, meal.rating)) : 0;

              const servedToday = meal?.lastServed && isSameDay(meal.lastServed, new Date());

              return (
                <div
                  key={idx}
                  className={`p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                    isToday ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{dateStr}</div>
                      {isToday && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </div>

                    {meal ? (
                      <div className="text-sm text-gray-700 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Planned:</span>

                        <Link
                          to={`/meals/${meal._id}?from=plan&week=${weekStartISO}`}
                          className="text-blue-700 hover:underline font-medium"
                        >
                          {meal.name}
                        </Link>

                        <div className="bg-gray-100 px-2 py-1 rounded-lg">
                          <StarRating value={ratingValue} readOnly size="sm" />
                        </div>

                        {servedToday && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                            Served today
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">No meal planned</div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                    <select
                      className="border rounded-lg p-2 text-sm w-full sm:w-64 bg-white"
                      value={selectedId}
                      disabled={savingDay === idx}
                      onChange={(e) => onPickMeal(idx, e.target.value)}
                    >
                      <option value="">— Select a meal —</option>
                      {meals.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-green-700 disabled:opacity-60"
                      disabled={!meal || servingDay === idx || servedToday}
                      onClick={() => onServeFromPlan(idx)}
                    >
                      {servedToday ? "Served" : servingDay === idx ? "Serving..." : "Serve"}
                    </button>

                    <button
                      type="button"
                      className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                      disabled={savingDay === idx}
                      onClick={() => onPickMeal(idx, "")}
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                      disabled={savingDay === idx}
                      onClick={() => suggestForDay(idx)}
                    >
                      Suggest
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Next upgrades: suggestion filters, “why this”, and drag-and-drop.
        </p>
      </div>
    </div>
  );
}
