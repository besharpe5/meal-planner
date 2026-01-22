const MealCard = ({ meal }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold">{meal.name}</h2>
      <p>{meal.notes}</p>
      <p className="text-sm text-gray-500">
        Last served: {new Date(meal.lastServed).toLocaleDateString()}
      </p>
    </div>
  );
};

export default MealCard;
