export function isTrialActive(user) {
  if (!user) return false;
  if (user.premiumSource !== "trial") return false;
  if (user.hasEverPaid) return false;
  if (!user.premiumExpiresAt) return false;
  return new Date(user.premiumExpiresAt).getTime() > Date.now();
}

export function isRestrictedFreeUser(user) {
  if (!user || user.isPremium) return false;
  if (isTrialActive(user)) return false;
  return user.premiumSource === "trial";
}