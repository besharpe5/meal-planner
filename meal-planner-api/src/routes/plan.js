const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const MealPlan = require("../models/MealPlan");

function toMidnightUTC(date) {
  const d = new Date(date);
  // normalize to midnight local (simple approach)
  d.setHours(0, 0, 0, 0);
  return d;
}

// Choose Monday as week start
function getWeekStart(date) {
  const d = toMidnightUTC(date);
  const day = d.getDay(); // 0=Sun,1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildWeekDays(weekStart) {
  // 7 consecutive days starting from weekStart
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

    const base = weekStart ? toMidnightUTC(weekStart) : getWeekStart(new Date());
    const ws = getWeekStart(base);

    let plan = await MealPlan.findOne({ family: req.user.family, weekStart: ws })
      .populate("days.meal");

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
