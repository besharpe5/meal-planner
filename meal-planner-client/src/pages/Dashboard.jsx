// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MealCard from "../components/MealCard";
import { getMeals, serveMeal, getMealSuggestions } from "../services/mealService";

export default function Dashboard() {
  const [meals, setMeals] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");
  const [servingId, setServingId] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setError("");
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
      setError("Failed to fetch meals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleServe = async (mealId) => {
    setError("");
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

      // replace the optimistic meal with server truth
      setMeals((current) => current.map((m) => (m._id === mealId ? updated : m)));
      setSuggestions((current) =>
        current.map((m) => (m._id === mealId ? updated : m))
      );

      // refresh suggestions order (since lastServed changed)
      const freshSuggestions = await getMealSuggestions(5);
      setSuggestions(freshSuggestions);
    } catch (err) {
      console.error(err);
      setMeals(prevMeals); // rollback
      setSuggestions(prevSuggestions); // rollback
      setError("Failed to serve meal");
    } finally {
      setServingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <Link
            to="/meals/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Meal
          </Link>
        </div>

        {error && <p className="text-red-500 mb-3">{error}</p>}

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
                <div className="flex items-end justify-between mb-3">
                  <h2 className="text-xl font-bold">Suggested Tonight</h2>

                  <button
                    onClick={loadData}
                    className="text-sm text-blue-700 hover:underline"
                    type="button"
                  >
                    Refresh
                  </button>
                </div>

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

            <div className="flex items-end justify-between mb-3">
              <h2 className="text-xl font-bold">All Meals</h2>

              <button
                onClick={loadData}
                className="text-sm text-blue-700 hover:underline"
                type="button"
              >
                Refresh
              </button>
            </div>

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
