// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MealCard from "../components/MealCard";
import { getMeals, serveMeal, getMealSuggestions } from "../services/mealService";
import { useToast } from "../context/ToastContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Dashboard() {
  useDocumentTitle("MealPlanned · Dashboard");

  const { addToast } = useToast();

  const [meals, setMeals] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [servingId, setServingId] = useState("");
  const [loading, setLoading] = useState(true);

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
    </div>
  );
}
