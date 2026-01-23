import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { getMeals, serveMeal } from "../services/mealService";
import { getPlan, setPlanDayMeal } from "../services/planService";

function toISODate(d) {
  // YYYY-MM-DD
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Monday-based week start (match backend)
function getWeekStartLocal(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
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

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Plan() {
  const { addToast } = useToast();

  const [meals, setMeals] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState(null); // dayIndex
  const [servingDay, setServingDay] = useState(null);

  const [weekStart, setWeekStart] = useState(() => getWeekStartLocal(new Date()));

  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);

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
        duration: 2000,
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
    const mealId = plan?.days?.[dayIndex]?.meal?._id;
    if (!mealId) return;

    setServingDay(dayIndex);

    try {
      await serveMeal(mealId);
      addToast({
        type: "success",
        title: "Served tonight",
        message: "Meal served count updated.",
      });
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

  const goPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goNextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goThisWeek = () => setWeekStart(getWeekStartLocal(new Date()));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow p-6">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Weekly Plan</h1>
            <p className="text-sm text-gray-600">{formatWeekRange(weekStart)}</p>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="divide-y">
            {plan?.days?.map((day, idx) => {
              const dateStr = new Date(day.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              });

              const selectedId = day.meal?._id || "";

              return (
                <div key={idx} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold">{dateStr}</div>
                    {day.meal ? (
                      <div className="text-sm text-gray-700 mt-1">
                        Planned:{" "}
                        <Link
                          to={`/meals/${day.meal._id}?from=plan&week=${weekStartISO}`}
                          className="text-blue-700 hover:underline"
>
                            {day.meal.name}
                          </Link>


                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">No meal planned</div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                    <select
                      className="border rounded-lg p-2 text-sm w-full sm:w-64"
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
                      disabled={!day.meal || servingDay === idx}
                      onClick={() => onServeFromPlan(idx)}
                    >
                      {servingDay === idx ? "Serving..." : "Serve"}
                    </button>

                    <button
                      type="button"
                      className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                      disabled={savingDay === idx}
                      onClick={() => onPickMeal(idx, "")}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Next upgrades: notes per day, drag-and-drop, and “auto-fill suggestions”.
        </p>
      </div>
    </div>
  );
}
