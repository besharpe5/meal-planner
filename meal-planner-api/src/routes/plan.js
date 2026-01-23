const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const MealPlan = require("../models/MealPlan");

// Parse "YYYY-MM-DD" as LOCAL midnight to avoid UTC shifting
function parseISODateLocal(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d); // local midnight
}

function toMidnightLocal(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Monday as week start (stable)
function getWeekStartLocal(date) {
  const d = toMidnightLocal(date);

  // Convert Sun(0)..Sat(6) to Mon(0)..Sun(6)
  const day = (d.getDay() + 6) % 7;

  d.setDate(d.getDate() - day); // back to Monday
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildWeekDays(weekStart) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    days.push({ date, meal: null, notes: "" });
  }
  return days;
}

// GET or create plan for a week
router.get("/", auth, async (req, res) => {
  try {
    const { weekStart } = req.query;

    // If weekStart is provided, parse as LOCAL date (NOT new Date(string))
    const base = weekStart
      ? parseISODateLocal(weekStart)
      : new Date();

    const ws = getWeekStartLocal(base);

    let plan = await MealPlan.findOne({
      family: req.user.family,
      weekStart: ws,
    }).populate("days.meal");

    if (!plan) {
      plan = new MealPlan({
        weekStart: ws,
        days: buildWeekDays(ws),
        family: req.user.family,
        createdBy: req.user._id,
      });

      await plan.save();
      plan = await MealPlan.findById(plan._id).populate("days.meal");
    }

    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Set meal for a day (dayIndex 0..6)
router.put("/:planId/day/:dayIndex", auth, async (req, res) => {
  try {
    const { planId, dayIndex } = req.params;
    const idx = Number(dayIndex);

    if (Number.isNaN(idx) || idx < 0 || idx > 6) {
      return res.status(400).json({ message: "dayIndex must be 0..6" });
    }

    const { mealId } = req.body; // allow null to clear

    const plan = await MealPlan.findOne({ _id: planId, family: req.user.family });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    plan.days[idx].meal = mealId || null;
    await plan.save();

    const updated = await MealPlan.findById(plan._id).populate("days.meal");
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
