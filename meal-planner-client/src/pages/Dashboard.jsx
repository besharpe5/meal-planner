// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MealCard from "../components/MealCard";
import { getMeals, serveMeal, getMealSuggestions } from "../services/mealService";
import { getPlan, servePlanDay, setPlanDayMeal } from "../services/planService";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getWeekStartLocal, toISODate, toLocalISODate } from "../utils/date";

export default function Dashboard() {
  useDocumentTitle("MealPlanned | Dashboard");

  const { addToast } = useToast();

  const [meals, setMeals] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [servingId, setServingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [planPrompt, setPlanPrompt] = useState(null);
  const [planPromptSaving, setPlanPromptSaving] = useState(false);

  const mealNameById = useMemo(() => {
    const map = new Map();
    meals.forEach((meal) => map.set(meal._id, meal.name));
    suggestions.forEach((meal) => map.set(meal._id, meal.name));
    return map;
  }, [meals, suggestions]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [mealsData, suggestionsData] = await Promise.all([
        getMeals(),
        getMealSuggestions(5),
      ]);

      setMeals(mealsData);
      setSuggestions(suggestionsData);
    } catch (err) {
      console.error(err);
      addToast({
        type: "error",
        title: "Load failed",
        message: "Could not fetch meals. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePlanForServe = async (mealId) => {
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
        : mealNameById.get(plannedMealId) || "Planned meal";
    const servedMealName = mealNameById.get(mealId) || "Served meal";
    const servedAlready = !!day.servedAt;

    if (entryType === "none") {
      await setPlanDayMeal(plan._id, { dayDate, mealId });
      await servePlanDay(plan._id, { dayDate, served: true });
      return;
    }

    if (entryType === "meal" && plannedMealId && String(plannedMealId) === String(mealId)) {
      if (!servedAlready) {
        await servePlanDay(plan._id, { dayDate, served: true });
      }
      return;
    }

    setPlanPrompt({
      planId: plan._id,
      dayDate,
      entryType,
      plannedMealId,
      plannedMealName,
      servedMealId: mealId,
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

  const handleServe = async (mealId) => {
    setServingId(mealId);

    // optimistic UI update
    const prevMeals = meals;
    const prevSuggestions = suggestions;

    const optimisticPatch = (list) =>
      list.map((m) =>
        m._id === mealId
          ? {
              ...m,
              timesServed: (m.timesServed ?? 0) + 1,
              lastServed: new Date().toISOString(),
            }
          : m
      );

    setMeals((current) => optimisticPatch(current));
    setSuggestions((current) => optimisticPatch(current));

    try {
      const updated = await serveMeal(mealId);

      // replace optimistic meal with server truth
      setMeals((current) => current.map((m) => (m._id === mealId ? updated : m)));
      setSuggestions((current) => current.map((m) => (m._id === mealId ? updated : m)));

      // refresh suggestions order (since lastServed changed)
      const freshSuggestions = await getMealSuggestions(5);
      setSuggestions(freshSuggestions);

      try {
        await updatePlanForServe(mealId);
      } catch (err) {
        console.error(err);
        addToast({
          type: "error",
          title: "Plan sync failed",
          message: err?.message || "Could not update today's plan.",
        });
      }

      addToast({
        type: "success",
        title: "Served tonight",
        message: "Updated times served and last served date.",
      });
    } catch (err) {
      console.error(err);

      // rollback
      setMeals(prevMeals);
      setSuggestions(prevSuggestions);

      addToast({
        type: "error",
        title: "Serve failed",
        message: "Could not update this meal. Please try again.",
      });
    } finally {
      setServingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              type="button"
              className="text-sm text-blue-700 hover:underline"
              disabled={loading}
            >
              Refresh
            </button>

            <Link
              to="/meals/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Meal
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-700">Loading…</p>
          </div>
        ) : meals.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-700">No meals yet. Add your first meal!</p>
          </div>
        ) : (
          <>
            {suggestions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Suggested Tonight</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestions.map((meal) => (
                    <MealCard
                      key={meal._id}
                      meal={meal}
                      onServe={handleServe}
                      serving={servingId === meal._id}
                    />
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-3">All Meals</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {meals.map((meal) => (
                <MealCard
                  key={meal._id}
                  meal={meal}
                  onServe={handleServe}
                  serving={servingId === meal._id}
                />
              ))}
            </div>
          </>
        )}
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
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
