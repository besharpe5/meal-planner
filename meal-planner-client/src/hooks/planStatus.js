const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getPlanStatusFromUser(user, now = Date.now()) {
  if (!user) return { planLabel: "Free", trialDaysLeft: 0, isPaidPremium: false };

  const isTrialUser = user.isPremium && user.premiumSource === "trial" && !user.hasEverPaid;

  if (isTrialUser) {
    const premiumExpiresAtMs = user.premiumExpiresAt ? new Date(user.premiumExpiresAt).getTime() : 0;
    const isTrialActive = premiumExpiresAtMs > now;

    if (isTrialActive) {
      const trialDaysLeft = Math.max(0, Math.ceil((premiumExpiresAtMs - now) / MS_PER_DAY));
      return { planLabel: "Free Trial", trialDaysLeft, isPaidPremium: false };
    }

    return { planLabel: "Free", trialDaysLeft: 0, isPaidPremium: false };
  }

  const isPaidPremium = !!(user.isPremium && user.premiumSource !== "trial");
  if (isPaidPremium) return { planLabel: "Premium", trialDaysLeft: 0, isPaidPremium: true };

  return { planLabel: "Free", trialDaysLeft: 0, isPaidPremium: false };
}