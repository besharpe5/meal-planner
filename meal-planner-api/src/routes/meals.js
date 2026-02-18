const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const mealLimit = require("../middleware/mealLimit");
const Meal = require("../models/Meal");
const { FREE_TIER_MEAL_LIMIT } = require("../config/constants");
const { getMealCountForFamily, adjustCachedMealCount } = require("../services/mealCountCache");

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
    adjustCachedMealCount(req.user.family, 1);
    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all meals for user's family
router.get("/", auth, async (req, res) => {
  try {
    const meals = await Meal.find({ family: req.user.family, deletedAt: null }).sort({ updatedAt: -1 });
    res.json(meals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET suggested meals (least recently served)
router.get("/suggestions", auth, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 5);

    const meals = await Meal.find({ family: req.user.family, deletedAt: null })
      .sort({ lastServed: 1, updatedAt: -1 }) // nulls first, then oldest dates
      .limit(limit);

    res.json(meals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET active meal count for user's family
router.get("/count", auth, async (req, res) => {
  try {
    const count = await getMealCountForFamily(req.user.family);
    res.json({ count, limit: req.user.isPremium ? null : FREE_TIER_MEAL_LIMIT });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET a single meal by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, family: req.user.family, deletedAt: null });
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    res.json(meal);
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
    );
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    res.json(meal);
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
    adjustCachedMealCount(req.user.family, -1);
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
      { new: true }
    );
    if (!meal) return res.status(404).json({ message: "Meal not found" });
     adjustCachedMealCount(req.user.family, 1);
    res.json(meal);
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

    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
