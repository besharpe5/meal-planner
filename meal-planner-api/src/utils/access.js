const { isTrialActive } = require("./trial");

function isRestrictedFreeUser(user) {
  if (!user || user.isFamilyPremium || user.isPremium) return false;
  if (isTrialActive(user)) return false;
  return user.premiumSource === "trial";
}

function getCurrentWeekStartYmd() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diffToMonday);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isCurrentWeek(weekYmd) {
  return String(weekYmd || "") === getCurrentWeekStartYmd();
}

module.exports = {
  isRestrictedFreeUser,
  getCurrentWeekStartYmd,
  isCurrentWeek,
};