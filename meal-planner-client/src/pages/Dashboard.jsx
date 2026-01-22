import { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await API.get("/meals");
        setMeals(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch meals");
      }
    };

    fetchMeals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <div key={meal._id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg">{meal.name}</h2>
            <p className="text-sm text-gray-600">Served: {meal.timesServed}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
