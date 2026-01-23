import API from "./api";

export async function getPlan(weekStartISO) {
  const res = await API.get(`/plan`, { params: { weekStart: weekStartISO } });
  return res.data;
}

export async function setPlanDayMeal(planId, dayIndex, mealId) {
  const res = await API.put(`/plan/${planId}/day/${dayIndex}`, { mealId: mealId || null });
  return res.data;
}

export async function suggestPlanDay(planId, dayIndex, options) {
  const res = await API.post(`/plan/${planId}/suggest/${dayIndex}`, options || {});
  return res.data; // { updatedPlan, suggestion|null, message? }
}

export async function fillPlanWeek(planId, options) {
  const res = await API.post(`/plan/${planId}/fill`, options || {});
  return res.data; // { updatedPlan, suggestions: [] }
}

export async function clearPlanWeek(planId) {
  const res = await API.post(`/plan/${planId}/clear`);
  return res.data; // { updatedPlan }
}
