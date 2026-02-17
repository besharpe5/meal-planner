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
  });
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
      isPremium: true,
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
  });
});