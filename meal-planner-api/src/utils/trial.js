const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isTrialActive(user) {
  return (
    user.premiumSource === "trial" &&
    !user.hasEverPaid &&
    user.premiumExpiresAt != null &&
    new Date(user.premiumExpiresAt) > new Date()
  );
}

function daysLeftInTrial(user) {
  if (!isTrialActive(user)) return 0;
  return Math.ceil((new Date(user.premiumExpiresAt) - new Date()) / MS_PER_DAY);
}

module.exports = { isTrialActive, daysLeftInTrial };
