function serializeUser(user) {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    family: user.family,
    isPremium: user.isPremium,
    isFamilyPremium: Boolean(user.isFamilyPremium),
    premiumPlan: user.premiumPlan || null,
    premiumSource: user.premiumSource,
    premiumStartedAt: user.premiumStartedAt || null,
    premiumExpiresAt: user.premiumExpiresAt,
    familyPremiumMember: user.familyPremiumMember || null,
    familyPremiumExpiresAt: user.familyPremiumExpiresAt || null,
    hasEverPaid: user.hasEverPaid,
    trialEndsAt: user.premiumSource === "trial" ? user.premiumExpiresAt : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = { serializeUser };