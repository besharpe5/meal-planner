import API from "./api";

export async function getPlan(weekStartISO) {
  const params = weekStartISO ? { weekStart: weekStartISO } : {};
  const res = await API.get("/plan", { params });
  return res.data;
}

export async function setPlanDayMeal(planId, dayIndex, mealId) {
  const res = await API.put(`/plan/${planId}/day/${dayIndex}`, { mealId });
  return res.data;
}
