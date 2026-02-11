const Meal = require("../models/Meal");
const { FREE_TIER_MEAL_LIMIT } = require("../config/constants");

module.exports = async function mealLimit(req, res, next) {
  try {
    if (req.user.isPremium) return next();

    const count = await Meal.countDocuments({
      family: req.user.family,
      deletedAt: null,
    });

    if (count >= FREE_TIER_MEAL_LIMIT) {
      return res.status(403).json({
        code: "MEAL_LIMIT_REACHED",
        message:
          "Free tier limited to 12 meals. Upgrade to Premium for unlimited meals.",
      });
    }

    next();
  } catch (err) {
    console.error("mealLimit error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
