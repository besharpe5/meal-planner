import API from "./api";

export const getMeals = async () => {
  const res = await API.get("/meals");
  return res.data;
};

export const createMeal = async (payload) => {
  const res = await API.post("/meals", payload);
  return res.data;
};

export const serveMeal = async (mealId) => {
  const res = await API.post(`/meals/${mealId}/serve`);
  return res.data; // returns updated meal
};
