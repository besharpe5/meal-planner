import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MealCard from "../components/MealCard";
import { getMeals, serveMeal } from "../services/mealService";

export default function Dashboard() {
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");
  const [servingId, setServingId] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = await getMeals();
        setMeals(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch meals");
      }
    };

    fetchMeals();
  }, []);

  const handleServe = async (mealId) => {
    setError("");
    setServingId(mealId);

    // Optional: optimistic UI (instant feedback)
    const prevMeals = meals;
    setMeals((current) =>
      current.map((m) =>
        m._id === mealId
          ? { ...m, timesServed: (m.timesServed ?? 0) + 1, lastServed: new Date().toISOString() }
          : m
      )
    );

    try {
      const updated = await serveMeal(mealId);
      // Replace the optimistic meal with the real one from server
      setMeals((current) => current.map((m) => (m._id === mealId ? updated : m)));
    } catch (err) {
      console.error(err);
      setMeals(prevMeals); // rollback
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
  
        {meals.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-700">No meals yet. Add your first meal!</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
  
}
