import api from "./api";

/**
 * Keeps your existing error-shaping behavior
 */
function normalizeAxiosError(err) {
  const status = err?.response?.status;
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Request failed";
  return Object.assign(new Error(message), { status, raw: err });
}

/**
 * ----------------- reads -----------------
 * GET /api/plan?week=YYYY-MM-DD
 */
export async function getPlan(weekStartYMD) {
  try {
    const { data } = await api.get("/plan", { params: { week: weekStartYMD } });
    return data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

/**
 * ----------------- day updates (schema-aligned) -----------------
 * PATCH /api/plan/:id/day
 */
export async function setPlanDayMeal(planId, { dayDate, mealId, notes }) {
  try {
    const { data } = await api.patch(`/plan/${planId}/day`, {
      dayDate,
      entryType: "meal",
      mealId,
      ...(typeof notes === "string" ? { notes } : {}),
    });
    return data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

export async function setPlanDayLeftovers(
  planId,
  { dayDate, leftoversFrom, countAsServed, notes }
) {
  try {
    const { data } = await api.patch(`/plan/${planId}/day`, {
      dayDate,
      entryType: "leftovers",
      leftoversFrom,
      ...(typeof countAsServed === "boolean" ? { countAsServed } : {}),
      ...(typeof notes === "string" ? { notes } : {}),
    });
    return data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

/**
 * Clear a day to "none"
 * PATCH /api/plan/:id/day
 */
export async function clearPlanDay(planId, { dayDate }) {
  try {
    const { data } = await api.patch(`/plan/${planId}/day`, {
      dayDate,
      entryType: "none",
    });
    return data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

/**
 * ----------------- suggestions -----------------
 * POST /api/plan/:id/suggest-day
 */
export async function suggestPlanDay(
  planId,
  { dayDate, minRating, excludeServedWithinDays, excludePlanned }
) {
  try {
    const { data } = await api.post(`/plan/${planId}/suggest-day`, {
      dayDate,
      minRating,
      excludeServedWithinDays,
      excludePlanned,
    });
    return data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

/**
 * Fill a week starting at startDate
 * POST /api/plan/:id/fill-week
 */
export async function fillPlanWeek(planId, startDate, options = {}) {
  try {
    const { data } = await api.post(`/plan/${planId}/fill-week`, {
      startDate,
      ...options,
    });
    return data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

/**
 * Clear a week starting at startDate
 * PATCH /api/plan/:id/clear-week
 */
export async function clearPlanWeek(planId, startDate) {
  try {
    const { data } = await api.patch(`/plan/${planId}/clear-week`, { startDate });
    return data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

/**
 * Mark a day as served (sets servedAt)
 * PATCH /api/plan/:id/serve-day
 */
export async function servePlanDay(planId, { dayDate, served = true, servedDate = null }) {
  try {
    const { data } = await api.patch(`/plan/${planId}/serve-day`, {
      dayDate,
      served,
      ...(servedDate ? { servedDate } : {}),
    });
    return data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
}

export default {
  getPlan,
  setPlanDayMeal,
  setPlanDayLeftovers,
  clearPlanDay,
  suggestPlanDay,
  fillPlanWeek,
  clearPlanWeek,
  servePlanDay,
};
