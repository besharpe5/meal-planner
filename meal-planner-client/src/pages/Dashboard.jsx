import { useEffect, useState } from 'react';
import { getMeals } from '../services/mealService';
import MealCard from '../components/MealCard';

const Dashboard = () => {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    getMeals()
      .then(res => setMeals(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Meal Planner Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map(meal => (
          <MealCard key={meal._id} meal={meal} />
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">This is where your meals will appear.</p>
    </div>
  )
}

