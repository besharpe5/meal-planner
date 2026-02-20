import API from "./api";

export const getMeals = async () => {
  const res = await API.get("/meals");
  return res.data;
};

export const getMealSuggestions = async (limit = 5) => {
  const res = await API.get(`/meals/suggestions?limit=${limit}`);
  return res.data;
};

export const createMeal = async (payload) => {
  const res = await API.post("/meals", payload);
  return res.data;
};

export const getMealById = async (id) => {
  const res = await API.get(`/meals/${id}`);
  return res.data;
};

export const updateMeal = async (id, payload) => {
  const res = await API.put(`/meals/${id}`, payload);
  return res.data;
};

export const deleteMeal = async (id) => {
  const res = await API.delete(`/meals/${id}`);
  return res.data;
};

export const restoreMeal = async (id) => {
  const res = await API.post(`/meals/${id}/restore`);
  return res.data;
};

export const serveMeal = async (mealId) => {
  const res = await API.post(`/meals/${mealId}/serve`);
  return res.data;
};

export const getMealCount = async () => {
  const res = await API.get("/meals/count");
  return res.data;
};