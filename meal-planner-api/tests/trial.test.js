const { isTrialActive, daysLeftInTrial } = require("../src/utils/trial");

describe("isTrialActive", () => {
  it("returns true for an active trial user", () => {
    const user = {
      premiumSource: "trial",
      hasEverPaid: false,
      premiumExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    expect(isTrialActive(user)).toBe(true);
  });

  it("returns false when premiumExpiresAt is in the past", () => {
    const user = {
      premiumSource: "trial",
      hasEverPaid: false,
      premiumExpiresAt: new Date(Date.now() - 1000),
    };
    expect(isTrialActive(user)).toBe(false);
  });

  it("returns false when hasEverPaid is true", () => {
    const user = {
      premiumSource: "trial",
      hasEverPaid: true,
      premiumExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    expect(isTrialActive(user)).toBe(false);
  });

  it("returns false when premiumSource is not trial", () => {
    const user = {
      premiumSource: "stripe",
      hasEverPaid: false,
      premiumExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    expect(isTrialActive(user)).toBe(false);
  });

  it("returns false when premiumSource is null", () => {
    const user = {
      premiumSource: null,
      hasEverPaid: false,
      premiumExpiresAt: null,
    };
    expect(isTrialActive(user)).toBe(false);
  });
});

describe("daysLeftInTrial", () => {
  it("returns 14 for a fresh trial", () => {
    const user = {
      premiumSource: "trial",
      hasEverPaid: false,
      premiumExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };
    expect(daysLeftInTrial(user)).toBe(14);
  });

  it("returns 1 when less than a day remains", () => {
    const user = {
      premiumSource: "trial",
      hasEverPaid: false,
      premiumExpiresAt: new Date(Date.now() + 1000),
    };
    expect(daysLeftInTrial(user)).toBe(1);
  });

  it("returns 0 for expired trial", () => {
    const user = {
      premiumSource: "trial",
      hasEverPaid: false,
      premiumExpiresAt: new Date(Date.now() - 1000),
    };
    expect(daysLeftInTrial(user)).toBe(0);
  });

  it("returns 0 for non-trial user", () => {
    const user = {
      premiumSource: "stripe",
      hasEverPaid: true,
      premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    expect(daysLeftInTrial(user)).toBe(0);
  });
});
