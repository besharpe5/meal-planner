const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Meal = require("../models/Meal");

// CREATE a meal
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, notes, imageUrl, rating } = req.body;

    if (!name) return res.status(400).json({ message: "Meal name is required" });

    const meal = new Meal({
      name,
      description,
      notes,
      imageUrl,
      rating,
      createdBy: req.user._id,
      family: req.user.family
    });

    await meal.save();
    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all meals for user's family
router.get("/", auth, async (req, res) => {
  try {
    const meals = await Meal.find({ family: req.user.family }).sort({ updatedAt: -1 });
    res.json(meals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET a single meal by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, family: req.user.family });
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
      { _id: req.params.id, family: req.user.family },
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
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, family: req.user.family });
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    res.json({ message: "Meal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Increment timesServed and update lastServed
router.post("/:id/serve", auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, family: req.user.family });
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
