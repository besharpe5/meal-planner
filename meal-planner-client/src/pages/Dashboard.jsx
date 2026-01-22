import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/meals");
        setMeals(res.data);
      } catch (err) {
        setError("Failed to fetch meals");
      }
    };

    fetchMeals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <div
            key={meal._id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            {meal.image && (
              <img
                src={meal.image}
                alt={meal.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <h2 className="font-bold text-lg">{meal.name}</h2>
            <p className="text-gray-600 text-sm">
              Served {meal.timesServed || 0} times
            </p>
            <p className="text-gray-500 text-sm">
              Last served: {meal.lastServed ? new Date(meal.lastServed).toLocaleDateString() : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
