const Family = require("../models/Family");

const FAMILY_PREMIUM_CACHE_TTL_MS = 5 * 60 * 1000;
const familyPremiumCache = new Map();

function cacheKey(familyId) {
  return String(familyId || "");
}

function getCachedFamilyPremiumStatus(familyId) {
  if (!familyId) return null;

  const cached = familyPremiumCache.get(cacheKey(familyId));
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    familyPremiumCache.delete(cacheKey(familyId));
    return null;
  }

  return cached.value;
}

function setCachedFamilyPremiumStatus(familyId, value) {
  if (!familyId) return;

  familyPremiumCache.set(cacheKey(familyId), {
    value,
    expiresAt: Date.now() + FAMILY_PREMIUM_CACHE_TTL_MS,
  });
}

function invalidateFamilyPremiumStatus(familyId) {
  if (!familyId) return;
  familyPremiumCache.delete(cacheKey(familyId));
}

function clearFamilyPremiumStatusCache() {
  familyPremiumCache.clear();
}

function isMemberPremium(member) {
  if (!member?.isPremium) return false;
  if (!member.premiumExpiresAt) return true;
  return new Date(member.premiumExpiresAt) > new Date();
}

async function getFamilyPremiumStatus(familyId) {
  const cached = getCachedFamilyPremiumStatus(familyId);
  if (cached) return cached;

  const family = await Family.findById(familyId).populate(
    "members",
    "name email isPremium premiumExpiresAt premiumSource"
  );

  if (!family) {
    const fallback = {
      isPremium: false,
      premiumMember: null,
      premiumExpiresAt: null,
    };
    setCachedFamilyPremiumStatus(familyId, fallback);
    return fallback;
  }

  const premiumMember = (family.members || []).find(isMemberPremium) || null;

  const value = {
    isPremium: Boolean(premiumMember),
    premiumMember: premiumMember
      ? {
          _id: premiumMember._id,
          name: premiumMember.name,
          email: premiumMember.email,
          premiumSource: premiumMember.premiumSource || null,
        }
      : null,
    premiumExpiresAt: premiumMember?.premiumExpiresAt || null,
  };

  setCachedFamilyPremiumStatus(familyId, value);
  return value;
}

async function isFamilyPremium(familyId) {
  const status = await getFamilyPremiumStatus(familyId);
  return status.isPremium;
}

module.exports = {
  isFamilyPremium,
  getFamilyPremiumStatus,
  invalidateFamilyPremiumStatus,
  clearFamilyPremiumStatusCache,
};