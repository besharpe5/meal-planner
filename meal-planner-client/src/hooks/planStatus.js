const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getPlanStatusFromUser(user, now = Date.now()) {
  if (!user) {
    return {
      planLabel: "Free",
      trialDaysLeft: 0,
      isPaidPremium: false,
      hasTrialHistory: false,
      isTrialActive: false,
      isTrialExpired: false,
    };
  }

  const hasTrialHistory = user.premiumSource === "trial" && !user.hasEverPaid;

  if (hasTrialHistory) {
    const premiumExpiresAtMs = user.premiumExpiresAt ? new Date(user.premiumExpiresAt).getTime() : 0;
    const isTrialActive = premiumExpiresAtMs > now;

    if (isTrialActive) {
      const trialDaysLeft = Math.max(0, Math.ceil((premiumExpiresAtMs - now) / MS_PER_DAY));
       return {
        planLabel: "Free Trial",
        trialDaysLeft,
        isPaidPremium: false,
        hasTrialHistory,
        isTrialActive: true,
        isTrialExpired: false,
      };
    }

    return { planLabel: "Free", trialDaysLeft: 0, isPaidPremium: false, hasTrialHistory, isTrialActive: false, isTrialExpired: true };
  }

  const isPaidPremium = !!(user.isPremium && user.premiumSource !== "trial");
  const isFamilyPremium = !!user.isFamilyPremium;

  if (isPaidPremium || isFamilyPremium) {
    return {
      planLabel: "Premium",
      trialDaysLeft: 0,
      isPaidPremium,
      hasTrialHistory: false,
      isTrialActive: false,
      isTrialExpired: false,
    };
  }

  return {
    planLabel: "Free",
    trialDaysLeft: 0,
    isPaidPremium: false,
    hasTrialHistory: false,
    isTrialActive: false,
    isTrialExpired: false,
  };
}