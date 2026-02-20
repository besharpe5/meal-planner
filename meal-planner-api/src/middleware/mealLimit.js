const { FREE_TIER_MEAL_LIMIT } = require("../config/constants");
const { getMealCountForFamily } = require("../services/mealCountCache");
const { isRestrictedFreeUser } = require("../utils/access");

module.exports = async function mealLimit(req, res, next) {
  try {
    if (!isRestrictedFreeUser(req.user)) return next();

    const count = await getMealCountForFamily(req.user.family);

    if (count >= FREE_TIER_MEAL_LIMIT) {
      return res.status(403).json({
        code: "MEAL_LIMIT_REACHED",
        message:
          "Free tier limited to 12 meals. Upgrade to Premium for unlimited meals.",
      });
    }

    return next();
  } catch (err) {
    console.error("mealLimit error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
