const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const MealPlan = require("../models/MealPlan");
const Meal = require("../models/Meal");
const auth = require("../middleware/auth"); // <-- adjust path if needed

// ---------------- helpers ----------------
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymdFromAnyDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function normalizeWeekStart(weekYMD) {
  // Normalize to a Date at UTC midnight for stable queries
  const d = new Date(weekYMD);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.toISOString().slice(0, 10));
}

function addDaysUTC(date, n) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function ensureWeekDays(plan) {
  // Ensure plan.days has exactly those 7 dates present (doesn't overwrite existing entries)
  const existing = new Set((plan.days || []).map((d) => ymdFromAnyDate(d.date)));
  for (let i = 0; i < 7; i++) {
    const date = addDaysUTC(plan.weekStart, i);
    const ymd = ymdFromAnyDate(date);
    if (existing.has(ymd)) continue;

    plan.days.push({
      date,
      entryType: "none",
      meal: null,
      leftoversFrom: null,
      countAsServed: false,
      servedAt: null,
      notes: "",
    });
  }
  plan.days.sort((a, b) => ymdFromAnyDate(a.date).localeCompare(ymdFromAnyDate(b.date)));
}

async function ensureWeekDaysAtomic(planId, weekStart) {
  // Adds missing days using atomic updates (no doc.save => no VersionError)
  for (let i = 0; i < 7; i++) {
    const date = addDaysUTC(weekStart, i);
    const ymd = ymdFromAnyDate(date);

    // Only push if that date doesn't already exist
    await MealPlan.updateOne(
      { _id: planId, days: { $not: { $elemMatch: { date: { $gte: new Date(ymd), $lt: addDaysUTC(new Date(ymd), 1) } } } } },
      {
        $push: {
          days: {
            date,
            entryType: "none",
            meal: null,
            leftoversFrom: null,
            countAsServed: false,
            servedAt: null,
            notes: "",
          },
        },
      }
    );
  }

  // Keep them sorted (optional but nice)
  await MealPlan.updateOne(
    { _id: planId },
    {
      $push: {
        days: {
          $each: [],
          $sort: { date: 1 },
        },
      },
    }
  );
}


// ---------------- routes ----------------

/**
 * GET /api/plan?week=YYYY-MM-DD
 * Fetch or create the plan for the logged-in user's family for that week.
 */
router.get("/", auth, async (req, res) => {
  try {
    const { week } = req.query;

    if (!week || typeof week !== "string") {
      return res.status(400).json({ message: "week (YYYY-MM-DD) query param is required" });
    }

    const weekStart = normalizeWeekStart(week);
    if (!weekStart) return res.status(400).json({ message: "Invalid week date" });

    const familyId = req.user.family;
    const userId = req.user._id;

    let plan = await MealPlan.findOne({ family: familyId, weekStart });

    if (!plan) {
      // Create plan *without* worrying about days being perfect yet
      plan = await MealPlan.create({
        weekStart,
        family: familyId,
        createdBy: userId,
        days: [],
      });
    }

    // ✅ Concurrency-safe “auto-heal”
    await ensureWeekDaysAtomic(plan._id, weekStart);

    // Re-fetch fresh version
    const refreshed = await MealPlan.findById(plan._id);
    res.json(refreshed);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});


/**
 * GET /api/plan/:id
 * Get by ObjectId (still useful after you have the plan _id)
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid plan id" });

    const plan = await MealPlan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Scope to same family
    if (String(plan.family) !== String(req.user.family)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * PATCH /api/plan/:id/day
 * body: { dayDate: "YYYY-MM-DD", entryType, mealId?, leftoversFrom?, countAsServed?, notes? }
 *
 * This matches your schema: ONE entry per day.
 */
router.patch("/:id/day", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid plan id" });

    const { dayDate, entryType, mealId, leftoversFrom, countAsServed, notes } = req.body || {};

    if (!dayDate || typeof dayDate !== "string") {
      return res.status(400).json({ message: "dayDate (YYYY-MM-DD) is required" });
    }

    if (!entryType || !["none", "meal", "leftovers"].includes(entryType)) {
      return res.status(400).json({ message: 'entryType must be "none", "meal", or "leftovers"' });
    }

    const plan = await MealPlan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    if (String(plan.family) !== String(req.user.family)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const day = (plan.days || []).find((d) => ymdFromAnyDate(d.date) === dayDate);
    if (!day) return res.status(404).json({ message: `No day found for ${dayDate}` });

    // Reset
    day.entryType = entryType;
    day.meal = null;
    day.leftoversFrom = null;
    day.countAsServed = false;
    if (typeof notes === "string") day.notes = notes;

    if (entryType === "meal") {
      if (!mealId || !isValidObjectId(mealId)) {
        return res.status(400).json({ message: "mealId must be a valid ObjectId when entryType is 'meal'" });
      }
      day.meal = mealId;
    }

    if (entryType === "leftovers") {
      const lf = toDateOrNull(leftoversFrom);
      if (!lf) return res.status(400).json({ message: "leftoversFrom must be a valid date" });

      const lfYmd = ymdFromAnyDate(lf);
      const weekDays = (plan.days || []).map((d) => ymdFromAnyDate(d.date));

      if (!weekDays.includes(lfYmd)) {
        return res.status(400).json({ message: "leftoversFrom must be within the same week" });
      }
      if (lfYmd >= dayDate) {
        return res.status(400).json({ message: "leftoversFrom must be earlier than the current day" });
      }

      day.leftoversFrom = lf;
      day.countAsServed = typeof countAsServed === "boolean" ? countAsServed : false;
    }

    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * PATCH /api/plan/:id/serve-day
 * body: { dayDate: "YYYY-MM-DD", served?: boolean, servedDate?: "YYYY-MM-DD" }
 */
router.patch("/:id/serve-day", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid plan id" });

    const { dayDate, served = true, servedDate = null } = req.body || {};
    if (!dayDate || typeof dayDate !== "string") {
      return res.status(400).json({ message: "dayDate (YYYY-MM-DD) is required" });
    }

    const plan = await MealPlan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    if (String(plan.family) !== String(req.user.family)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const day = (plan.days || []).find((d) => ymdFromAnyDate(d.date) === dayDate);
    if (!day) return res.status(404).json({ message: `No day found for ${dayDate}` });

    // Determine the timestamp to use
    let timestampToUse;
    if (served) {
      if (servedDate && typeof servedDate === "string") {
        // Validate servedDate format and that it's not in the future
        const requestedDate = new Date(servedDate);
        if (Number.isNaN(requestedDate.getTime())) {
          return res.status(400).json({ message: "Invalid servedDate format" });
        }

        // Prevent future dates
        const now = new Date();
        if (requestedDate > now) {
          return res.status(400).json({ message: "Cannot serve a meal in the future" });
        }

        timestampToUse = requestedDate;
      } else {
        timestampToUse = new Date();
      }
    } else {
      timestampToUse = null;
    }

    day.servedAt = timestampToUse;

    // If marking as served and day has a meal, update meal's lastServed
    if (served && day.entryType === "meal" && day.meal) {
      const Meal = require("../models/Meal");
      const meal = await Meal.findOne({
        _id: day.meal,
        family: req.user.family,
        deletedAt: null
      });

      if (meal) {
        meal.timesServed += 1;
        meal.lastServed = timestampToUse;
        await meal.save();
      }
    }

    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * PATCH /api/plan/:id/clear-week
 * body: { startDate: "YYYY-MM-DD" }
 */
router.patch("/:id/clear-week", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid plan id" });

    const { startDate } = req.body || {};
    if (!startDate || typeof startDate !== "string") {
      return res.status(400).json({ message: "startDate (YYYY-MM-DD) is required" });
    }

    const start = normalizeWeekStart(startDate);
    if (!start) return res.status(400).json({ message: "Invalid startDate" });

    const plan = await MealPlan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    if (String(plan.family) !== String(req.user.family)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    for (let i = 0; i < 7; i++) {
      const date = addDaysUTC(start, i);
      const ymd = ymdFromAnyDate(date);
      const day = (plan.days || []).find((d) => ymdFromAnyDate(d.date) === ymd);
      if (!day) continue;

      // Preserve served days
      if (day.servedAt) continue;

      day.entryType = "none";
      day.meal = null;
      day.leftoversFrom = null;
      day.countAsServed = false;
      day.notes = "";
    }

    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});

/**
 * POST /api/plan/:id/fill-week
 * body: { startDate: "YYYY-MM-DD" }
 */
/**
 * POST /api/plan/:id/fill-week
 * body: { startDate: "YYYY-MM-DD", minRating?, excludeServedWithinDays?, excludePlanned? }
 *
 * Fills all days whose entryType is "none" with suggested meals.
 * Returns: { updatedPlan, suggestions }
 */
router.post("/:id/fill-week", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid plan id" });

    const {
      startDate,
      minRating = 0,
      excludeServedWithinDays = 0,
      excludePlanned = true,
    } = req.body || {};

    if (!startDate || typeof startDate !== "string") {
      return res.status(400).json({ message: "startDate (YYYY-MM-DD) is required" });
    }

    const start = normalizeWeekStart(startDate);
    if (!start) return res.status(400).json({ message: "Invalid startDate" });

    const plan = await MealPlan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    if (String(plan.family) !== String(req.user.family)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Align plan to requested week + ensure 7 days exist
    plan.weekStart = start;
    ensureWeekDays(plan);

    // Pull meals for this family only
    const allMeals = await Meal.find({ family: req.user.family, deletedAt: null }).lean();
    if (!allMeals.length) {
      return res.status(404).json({ message: "No meals exist to suggest." });
    }

    const now = new Date();

    const plannedMealIds = new Set(
      (plan.days || [])
        .filter((d) => d?.entryType === "meal" && d?.meal)
        .map((d) => String(d.meal))
    );

    const ratingOk = (meal) => {
      const r = typeof meal?.rating === "number" ? meal.rating : 0;
      return r >= (Number(minRating) || 0);
    };

    const passesServedWindow = (meal) => {
      const days = Number(excludeServedWithinDays) || 0;
      if (!days) return true;

      const lastServed = meal?.lastServed ? new Date(meal.lastServed) : null;
      if (!lastServed || Number.isNaN(lastServed.getTime())) return true;

      const diffMs = now.getTime() - lastServed.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return diffDays >= days;
    };

    const pickWeightedByRating = (candidates) => {
      if (!candidates.length) return null;

      // Higher rating => higher chance
      const weighted = [];
      for (const m of candidates) {
        const r = typeof m?.rating === "number" ? Math.max(0, Math.min(5, m.rating)) : 0;
        const weight = Math.max(1, Math.round(r * 2)); // 0-5 => 1-10
        for (let i = 0; i < weight; i++) weighted.push(m);
      }
      return weighted[Math.floor(Math.random() * weighted.length)];
    };

    const buildReason = (pick) => {
      const parts = [];
      parts.push(`⭐ ${typeof pick.rating === "number" ? pick.rating.toFixed(1) : "0.0"} rating`);
      if (Number(excludeServedWithinDays) > 0) parts.push(`not served in last ${Number(excludeServedWithinDays)} days`);
      if (excludePlanned) parts.push("avoids duplicates when possible");
      return parts.join(" • ");
    };

    const suggestions = [];

    for (let i = 0; i < (plan.days || []).length; i++) {
      const day = plan.days[i];
      if (!day || day.entryType !== "none") continue;

      let candidates = allMeals.filter((m) => ratingOk(m) && passesServedWindow(m));

      if (excludePlanned) {
        candidates = candidates.filter((m) => !plannedMealIds.has(String(m._id)));
      }

      // fallback ladder (gentle relax)
      if (!candidates.length && excludePlanned) {
        // allow duplicates
        candidates = allMeals.filter((m) => ratingOk(m) && passesServedWindow(m));
      }
      if (!candidates.length && Number(excludeServedWithinDays) > 0) {
        // ignore served window
        candidates = allMeals.filter((m) => ratingOk(m));
      }
      if (!candidates.length) {
        // anything
        candidates = allMeals;
      }

      const pick = pickWeightedByRating(candidates);
      if (!pick) continue;

      day.entryType = "meal";
      day.meal = pick._id;
      day.leftoversFrom = null;
      day.countAsServed = false;
      day.servedAt = null;

      plannedMealIds.add(String(pick._id));

      suggestions.push({
        dayIndex: i,
        dayDate: ymdFromAnyDate(day.date),
        mealId: pick._id,
        name: pick.name,
        reason: buildReason(pick),
      });
    }

    await plan.save();

    res.json({ updatedPlan: plan, suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});


/**
 * POST /api/plan/:id/suggest-day
 * body: { dayDate: "YYYY-MM-DD", minRating?, excludeServedWithinDays?, excludePlanned? }
 *
 * Picks a meal based on filters and writes it into the plan day as entryType "meal".
 * Returns: { updatedPlan, suggestion }
 */
router.post("/:id/suggest-day", auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid plan id" });

    const {
      dayDate,
      minRating = 0,
      excludeServedWithinDays = 0,
      excludePlanned = true,
    } = req.body || {};

    if (!dayDate || typeof dayDate !== "string") {
      return res.status(400).json({ message: "dayDate (YYYY-MM-DD) is required" });
    }

    const plan = await MealPlan.findById(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    if (String(plan.family) !== String(req.user.family)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ auto-heal days so suggestion always works
    ensureWeekDays(plan);

    const day = (plan.days || []).find((d) => ymdFromAnyDate(d.date) === dayDate);
    if (!day) return res.status(404).json({ message: `No day found for ${dayDate}` });

    // Keep your “only suggest into empty day” behavior
    if (day.entryType && day.entryType !== "none") {
      return res.status(400).json({ message: "Day already has an entry. Clear it first to suggest." });
    }

    const Meal = require("../models/Meal");

    // ✅ CRITICAL FIX: scope meals to THIS family
    const allMeals = await Meal.find({ family: req.user.family, deletedAt: null }).lean();

    if (!allMeals.length) {
      return res.status(404).json({ message: "No meals exist to suggest for this family." });
    }

    const plannedMealIds = new Set(
      (plan.days || [])
        .filter((d) => d?.entryType === "meal" && d?.meal)
        .map((d) => String(typeof d.meal === "object" ? d.meal._id : d.meal))
    );

    const now = new Date();

    const ratingOk = (meal) => {
      const r = typeof meal?.rating === "number" ? meal.rating : 0;
      return r >= (Number(minRating) || 0);
    };

    const passesServedWindow = (meal) => {
      const days = Number(excludeServedWithinDays) || 0;
      if (!days) return true;

      const lastServed = meal?.lastServed ? new Date(meal.lastServed) : null;
      if (!lastServed || Number.isNaN(lastServed.getTime())) return true;

      const diffMs = now.getTime() - lastServed.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return diffDays >= days;
    };

    let candidates = allMeals.filter((m) => ratingOk(m) && passesServedWindow(m));
    if (excludePlanned) candidates = candidates.filter((m) => !plannedMealIds.has(String(m._id)));

    // fallback ladder
    if (!candidates.length && excludePlanned) candidates = allMeals.filter((m) => ratingOk(m) && passesServedWindow(m));
    if (!candidates.length && excludeServedWithinDays) candidates = allMeals.filter((m) => ratingOk(m));
    if (!candidates.length) candidates = allMeals;

    // weighted by rating
    const weighted = [];
    for (const m of candidates) {
      const r = typeof m?.rating === "number" ? Math.max(0, Math.min(5, m.rating)) : 0;
      const weight = Math.max(1, Math.round(r * 2)); // 1..10
      for (let i = 0; i < weight; i++) weighted.push(m);
    }

    const pick = weighted[Math.floor(Math.random() * weighted.length)];

    // write into plan
    day.entryType = "meal";
    day.meal = pick._id;
    day.leftoversFrom = null;
    day.countAsServed = false;
    day.servedAt = null;

    await plan.save();

    const reasonParts = [];
    reasonParts.push(`⭐ ${typeof pick.rating === "number" ? pick.rating.toFixed(1) : "0.0"} rating`);
    if (Number(excludeServedWithinDays) > 0) reasonParts.push(`not served in last ${excludeServedWithinDays} days`);
    if (excludePlanned) reasonParts.push("avoids duplicates when possible");

    res.json({
      updatedPlan: plan,
      suggestion: {
        mealId: pick._id,
        name: pick.name,
        reason: reasonParts.join(" • "),
      },
      dayDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
});



module.exports = router;
