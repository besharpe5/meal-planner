const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const mealLimit = require("../middleware/mealLimit");
const Meal = require("../models/Meal");
const { FREE_TIER_MEAL_LIMIT } = require("../config/constants");
const { getMealCountForFamily, invalidateMealCountCache } = require("../services/mealCountCache");
const { isRestrictedFreeUser } = require("../utils/access");

const MEAL_CREATOR_POPULATE = { path: "createdBy", select: "name" };

function mealWithCreatorName(mealDoc) {
  const meal = mealDoc?.toObject ? mealDoc.toObject() : mealDoc;
  if (!meal) return meal;

  return {
    ...meal,
    createdByName: meal.createdBy?.name || "Unknown",
  };
}

// CREATE a meal
router.post("/", auth, mealLimit, async (req, res) => {
  try {
    const { name, description, notes, rating } = req.body;

    if (!name) return res.status(400).json({ message: "Meal name is required" });

    const meal = new Meal({
      name,
      description,
      notes,
      rating,
      createdBy: req.user._id,
      family: req.user.family
    });

    await meal.save();
    await meal.populate(MEAL_CREATOR_POPULATE);
    invalidateMealCountCache(req.user.family);
    res.json(mealWithCreatorName(meal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all meals for user's family
router.get("/", auth, async (req, res) => {
  try {
    const meals = await Meal.find({ family: req.user.family, deletedAt: null })
      .sort({ updatedAt: -1 })
      .populate(MEAL_CREATOR_POPULATE);
    res.json(meals.map(mealWithCreatorName));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET suggested meals (rating + recency weighted)
router.get("/suggestions", auth, async (req, res) => {
  try {
    if (isRestrictedFreeUser(req.user)) {
      return res.status(403).json({
        code: "PREMIUM_SUGGESTIONS_REQUIRED",
        message: "Premium users save time with smart suggestions based on ratings and recency.",
      });
    }
     const limit = Math.max(1, Number(req.query.limit || 5));
    const excludeServedWithinDays = 3;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - excludeServedWithinDays);

    const candidateMeals = await Meal.find({
      family: req.user.family,
      deletedAt: null,
      $or: [
        { lastServed: null },
        { lastServed: { $lt: cutoffDate } },
      ],
    })
      .populate(MEAL_CREATOR_POPULATE)
      .lean();

    const now = Date.now();

    const suggestions = candidateMeals
      .map((meal) => {
        const lastServedTs = meal?.lastServed ? new Date(meal.lastServed).getTime() : null;

        const daysSinceServed = Number.isFinite(lastServedTs)
          ? Math.floor((now - lastServedTs) / (1000 * 60 * 60 * 24))
          : 9999; // never served => very high priority

        const rating = typeof meal?.rating === "number" ? meal.rating : 3;
        const score = daysSinceServed * (rating / 3);

        return { ...meal, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;

        // tie-breaker: least recently served first, then most recently updated
        const aLastServed = a?.lastServed ? new Date(a.lastServed).getTime() : -Infinity;
        const bLastServed = b?.lastServed ? new Date(b.lastServed).getTime() : -Infinity;
        if (aLastServed !== bLastServed) return aLastServed - bLastServed;

        const aUpdated = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bUpdated = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bUpdated - aUpdated;
      })
      .slice(0, limit)
      .map(({ score, ...meal }) => mealWithCreatorName(meal));

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET active meal count for user's family
router.get("/count", auth, async (req, res) => {
  try {
    const count = await getMealCountForFamily(req.user.family);
    res.json({ count, limit: req.user.isFamilyPremium ? null : FREE_TIER_MEAL_LIMIT, isFamilyPremium: req.user.isFamilyPremium });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET a single meal by ID
router.get("/:id", auth, async (req, res) => {
  try {
     const meal = await Meal.findOne({ _id: req.params.id, family: req.user.family, deletedAt: null })
      .populate(MEAL_CREATOR_POPULATE);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    res.json(mealWithCreatorName(meal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE a meal
router.put("/:id", auth, async (req, res) => {
  try {
    const updates = req.body;
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, family: req.user.family, deletedAt: null }, 
      updates,
      { new: true }
    ).populate(MEAL_CREATOR_POPULATE);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    res.json(mealWithCreatorName(meal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a meal
router.delete("/:id", auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, family: req.user.family, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    invalidateMealCountCache(req.user.family);
    res.json({ message: "Meal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// RESTORE a soft-deleted meal
router.post("/:id/restore", auth, mealLimit, async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, family: req.user.family, deletedAt: { $ne: null } },
      { deletedAt: null },
      { new: true }
    ).populate(MEAL_CREATOR_POPULATE);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    invalidateMealCountCache(req.user.family);
    res.json(mealWithCreatorName(meal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Increment timesServed and update lastServed
router.post("/:id/serve", auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, family: req.user.family, deletedAt: null });
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    meal.timesServed += 1;
    meal.lastServed = new Date();
    await meal.save();
    await meal.populate(MEAL_CREATOR_POPULATE);

    res.json(mealWithCreatorName(meal));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
