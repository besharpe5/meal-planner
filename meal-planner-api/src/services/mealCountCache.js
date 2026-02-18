const Meal = require("../models/Meal");

const CACHE_TTL_MS = 30 * 1000;
const mealCountCache = new Map();

function getCacheKey(familyId) {
  return String(familyId);
}

function getCachedMealCount(familyId) {
  if (!familyId) return null;

  const key = getCacheKey(familyId);
  const entry = mealCountCache.get(key);

  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    mealCountCache.delete(key);
    return null;
  }

  return entry.count;
}

function setCachedMealCount(familyId, count) {
  if (!familyId) return;

  mealCountCache.set(getCacheKey(familyId), {
    count,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function getMealCountForFamily(familyId) {
  const cachedCount = getCachedMealCount(familyId);
  if (cachedCount !== null) return cachedCount;

  const count = await Meal.countDocuments({ family: familyId, deletedAt: null });
  setCachedMealCount(familyId, count);
  return count;
}

function adjustCachedMealCount(familyId, delta) {
  const cachedCount = getCachedMealCount(familyId);
  if (cachedCount === null) return;

  setCachedMealCount(familyId, Math.max(0, cachedCount + delta));
}

function invalidateMealCountCache(familyId) {
  if (!familyId) return;
  mealCountCache.delete(getCacheKey(familyId));
}

function clearMealCountCache() {
  mealCountCache.clear();
}

module.exports = {
  getMealCountForFamily,
  adjustCachedMealCount,
  invalidateMealCountCache,
  clearMealCountCache,
};