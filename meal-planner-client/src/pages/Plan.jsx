import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { getMeals, serveMeal } from "../services/mealService";
import {
  getPlan,
  setPlanDayMeal,
  suggestPlanDay,
  fillPlanWeek,
  clearPlanWeek,
} from "../services/planService";
import StarRating from "../components/StarRating";

function parseISODateLocal(iso) {
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

function getWeekStartLocal(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
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

function daysSince(dateString) {
  if (!dateString) return Infinity;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return Infinity;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WhyTooltip({ text }) {
  if (!text) return null;
  return (
    <span className="relative inline-flex items-center group">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
        i
      </span>
      <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition absolute left-1/2 -translate-x-1/2 top-7 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-50">
        {text}
      </span>
    </span>
  );
}

export default function Plan() {
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [savingDay, setSavingDay] = useState(null);
  const [servingDay, setServingDay] = useState(null);

  // Suggest/fill state
  const [fillingWeek, setFillingWeek] = useState(false);
  const [suggestingDay, setSuggestingDay] = useState(null);

  // Store last suggestion "why" per dayIndex (so tooltip persists)
  const [whyByDay, setWhyByDay] = useState({}); // { [idx]: string }

  // Filters
  const [minRating, setMinRating] = useState(0);
  const [excludeServedWithinDays, setExcludeServedWithinDays] = useState(0);
  const [excludePlanned, setExcludePlanned] = useState(true);

  // Clear all confirmation (double click within 5 seconds)
  const [clearArmed, setClearArmed] = useState(false);
  const clearTimerRef = useRef(null);

  const [weekStart, setWeekStart] = useState(() => {
    const weekParam = searchParams.get("week");
    if (!weekParam) return getWeekStartLocal(new Date());

    const d = parseISODateLocal(weekParam);
    if (Number.isNaN(d.getTime())) return getWeekStartLocal(new Date());

    return getWeekStartLocal(d);
  });

  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);
  const todayISO = useMemo(() => toISODate(new Date()), []);

  // Normalize URL to Monday
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

  const optionsPayload = useMemo(
    () => ({
      minRating: Number(minRating) || 0,
      excludeServedWithinDays: Number(excludeServedWithinDays) || 0,
      excludePlanned: !!excludePlanned,
    }),
    [minRating, excludeServedWithinDays, excludePlanned]
  );

  const load = async () => {
    setLoading(true);
    try {
      const [mealsData, planData] = await Promise.all([
        getMeals(),
        getPlan(weekStartISO),
      ]);
      setMeals(mealsData);
      setPlan(planData);
      setWhyByDay({}); // reset reasons when week changes/reloads
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

  // --- Backend-driven Suggest (A + B + C) ---
  const suggestForDay = async (dayIndex) => {
    if (!plan?._id) return;

    setSuggestingDay(dayIndex);

    try {
      const res = await suggestPlanDay(plan._id, dayIndex, optionsPayload);

      if (!res?.suggestion) {
        addToast({
          type: "info",
          title: "No suggestion",
          message: res?.message || "No meal matched your filters.",
          duration: 2200,
        });
        return;
      }

      setPlan(res.updatedPlan);
      setWhyByDay((prev) => ({ ...prev, [dayIndex]: res.suggestion.reason }));

      addToast({
        type: "success",
        title: "Suggested meal",
        message: `${DAY_NAMES[dayIndex]}: ${res.suggestion.name}`,
        duration: 1800,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Suggest failed",
        message: "Could not generate a suggestion.",
      });
    } finally {
      setSuggestingDay(null);
    }
  };

  const fillWeekWithSuggestions = async () => {
    if (!plan?._id || fillingWeek) return;

    setFillingWeek(true);

    try {
      const res = await fillPlanWeek(plan._id, optionsPayload);

      setPlan(res.updatedPlan);

      // Store "why" reasons for the filled days
      if (Array.isArray(res.suggestions)) {
        setWhyByDay((prev) => {
          const next = { ...prev };
          res.suggestions.forEach((s) => {
            next[s.dayIndex] = s.reason;
          });
          return next;
        });
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

  const armClearAll = () => {
    setClearArmed(true);

    addToast({
      type: "warning",
      title: "Confirm clear week",
      message: "Click “Clear week” again to remove all planned meals.",
      duration: 3500,
    });

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setClearArmed(false), 5000);
  };

  const clearAllWeek = async () => {
    if (!plan?._id) return;

    if (!clearArmed) {
      armClearAll();
      return;
    }

    setClearArmed(false);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    try {
      const res = await clearPlanWeek(plan._id);
      setPlan(res.updatedPlan);
      setWhyByDay({});

      addToast({
        type: "success",
        title: "Week cleared",
        message: "All planned meals removed.",
        duration: 1800,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Clear failed",
        message: "Could not clear the week.",
      });
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6">Loading…</div>
        </div>
      </div>
    );
  }

  if (!meals.length) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-1">Weekly Plan</h1>
            <p className="text-sm text-gray-600 mb-4">{formatWeekRange(weekStart)}</p>
            <p className="text-gray-700 mb-4">
              Add meals first, then you can plan and get suggestions.
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

  const activeFiltersText = [
    minRating > 0 ? `≥ ⭐${Number(minRating).toFixed(1)}` : null,
    excludeServedWithinDays > 0 ? `exclude < ${excludeServedWithinDays} days` : null,
    excludePlanned ? "avoid duplicates" : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Weekly Plan</h1>
            <p className="text-sm text-gray-600">{formatWeekRange(weekStart)}</p>
            {activeFiltersText ? (
              <p className="text-xs text-gray-500 mt-1">Suggestions: {activeFiltersText}</p>
            ) : null}
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

            <button
              onClick={clearAllWeek}
              className={`border rounded-lg px-3 py-2 text-sm disabled:opacity-60 ${
                clearArmed ? "border-red-400 bg-red-50 text-red-700" : "hover:bg-white"
              }`}
              type="button"
              disabled={!plan?._id}
              title={clearArmed ? "Click again to confirm" : "Clear all meals in this week"}
            >
              {clearArmed ? "Confirm clear" : "Clear week"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Min rating</label>
              <select
                className="w-full border rounded-lg p-2 bg-white"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value={0}>Any</option>
                <option value={3}>≥ 3.0</option>
                <option value={3.5}>≥ 3.5</option>
                <option value={4}>≥ 4.0</option>
                <option value={4.5}>≥ 4.5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Exclude served within (days)
              </label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-lg p-2"
                value={excludeServedWithinDays}
                onChange={(e) => setExcludeServedWithinDays(Number(e.target.value))}
                placeholder="0 = no exclusion"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: 14 excludes meals served in last 2 weeks.
              </p>
            </div>

            <div className="flex items-start gap-2 sm:justify-end sm:pt-7">
              <input
                id="excludePlanned"
                type="checkbox"
                checked={excludePlanned}
                onChange={(e) => setExcludePlanned(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="excludePlanned" className="text-sm">
                Avoid duplicates in week
              </label>
            </div>
          </div>
        </div>

        {/* Days list */}
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

              const whyText = whyByDay[idx] || (meal ? `Last served ${daysSince(meal.lastServed)} days ago • ⭐ ${ratingValue.toFixed(1)}` : null);

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

                        <WhyTooltip text={whyByDay[idx] || null} />

                        {servedToday && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                            Served today
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <span>No meal planned</span>
                        {whyByDay[idx] ? <WhyTooltip text={whyByDay[idx]} /> : null}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                    <select
                      className="border rounded-lg p-2 text-sm w-full sm:w-64 bg-white"
                      value={selectedId}
                      disabled={savingDay === idx || suggestingDay === idx || fillingWeek}
                      onChange={(e) => {
                        setWhyByDay((prev) => {
                          const next = { ...prev };
                          delete next[idx];
                          return next;
                        });
                        onPickMeal(idx, e.target.value);
                      }}
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
                      disabled={savingDay === idx || suggestingDay === idx || fillingWeek}
                      onClick={() => {
                        setWhyByDay((prev) => {
                          const next = { ...prev };
                          delete next[idx];
                          return next;
                        });
                        onPickMeal(idx, "");
                      }}
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                      disabled={suggestingDay === idx || fillingWeek}
                      onClick={() => suggestForDay(idx)}
                      title="Pick a smart suggestion"
                    >
                      {suggestingDay === idx ? "Suggesting..." : "Suggest"}
                    </button>

                    {/* Optional “why” link (if you prefer explicit) */}
                    {whyByDay[idx] ? (
                      <div className="hidden sm:block">
                        <WhyTooltip text={whyByDay[idx]} />
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Next upgrades: day notes UI, bulk save, and drag-and-drop planning.
        </p>
      </div>
    </div>
  );
}
