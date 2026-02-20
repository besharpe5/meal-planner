const Meal = require("../models/Meal");
const { FREE_TIER_MEAL_LIMIT } = require("../config/constants");
const { isRestrictedFreeUser } = require("../utils/access");

module.exports = async function mealLimit(req, res, next) {
  try {
    if (!isRestrictedFreeUser(req.user)) return next();
  
    const familyMealCount = await Meal.countDocuments({
      family: req.user.family,
      deletedAt: null,
    });
    (req.user.family);

    if (familyMealCount >= FREE_TIER_MEAL_LIMIT) {
      return res.status(403).json({
        code: "MEAL_LIMIT_REACHED",
         error: "Family meal limit reached",
        familyMealCount,
        limit: FREE_TIER_MEAL_LIMIT,
        message:
          "Your family has reached the 12-meal limit. Upgrade to Premium for unlimited meals for everyone.",
      });
    }

    return next();
  } catch (err) {
    console.error("mealLimit error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
