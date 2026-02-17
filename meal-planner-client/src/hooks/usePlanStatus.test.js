import test from "node:test";
import assert from "node:assert/strict";
import { getPlanStatusFromUser } from "./planStatus.js";

const now = new Date("2026-01-15T00:00:00.000Z").getTime();

test("returns free plan details for free users", () => {
  const result = getPlanStatusFromUser({ isPremium: false }, now);

  assert.deepEqual(result, {
    planLabel: "Free",
    trialDaysLeft: 0,
    isPaidPremium: false,
    hasTrialHistory: false,
    isTrialActive: false,
    isTrialExpired: false,
  });
});

test("returns trial plan details for active trials", () => {
  const result = getPlanStatusFromUser(
    {
      isPremium: true,
      premiumSource: "trial",
      hasEverPaid: false,
      premiumExpiresAt: "2026-01-18T00:00:00.000Z",
    },
    now
  );

  assert.deepEqual(result, {
    planLabel: "Free Trial",
    trialDaysLeft: 3,
    isPaidPremium: false,
    hasTrialHistory: true,
    isTrialActive: true,
    isTrialExpired: false,
  });
});

test("returns trial banner ending-today state on last trial day", () => {
  const result = getPlanStatusFromUser(
    {
      isPremium: true,
      premiumSource: "trial",
      hasEverPaid: false,
      premiumExpiresAt: "2026-01-15T12:00:00.000Z",
    },
    now
  );

  assert.equal(result.trialDaysLeft, 1);
  assert.equal(result.isTrialActive, true);
  assert.equal(result.hasTrialHistory, true);
});

test("returns premium plan details for paid premium users", () => {
  const result = getPlanStatusFromUser(
    {
      isPremium: true,
      premiumSource: "subscription",
      hasEverPaid: true,
      premiumExpiresAt: "2026-12-01T00:00:00.000Z",
    },
    now
  );

  assert.deepEqual(result, {
    planLabel: "Premium",
    trialDaysLeft: 0,
    isPaidPremium: true,
  });
});

test("returns free plan details for expired trials", () => {
  const result = getPlanStatusFromUser(
    {
      isPremium: false,
      premiumSource: "trial",
      hasEverPaid: false,
      premiumExpiresAt: "2026-01-10T00:00:00.000Z",
    },
    now
  );

  assert.deepEqual(result, {
    planLabel: "Free",
    trialDaysLeft: 0,
    isPaidPremium: false,
    hasTrialHistory: true,
    isTrialActive: false,
    isTrialExpired: true,
  });
});