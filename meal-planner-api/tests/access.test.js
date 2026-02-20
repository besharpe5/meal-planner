const { isRestrictedFreeUser, isCurrentWeek } = require("../src/utils/access");

describe("access utils", () => {
  test("flags expired-trial free users as restricted", () => {
    expect(
      isRestrictedFreeUser({
        isPremium: false,
        premiumSource: "trial",
        hasEverPaid: false,
        premiumExpiresAt: new Date(Date.now() - 1000),
      })
    ).toBe(true);
  });

  test("does not flag active trials as restricted", () => {
    expect(
      isRestrictedFreeUser({
        isPremium: false,
        premiumSource: "trial",
        hasEverPaid: false,
        premiumExpiresAt: new Date(Date.now() + 1000),
      })
    ).toBe(false);
  });

  test("does not flag legacy free users as restricted", () => {
    expect(isRestrictedFreeUser({ isPremium: false, premiumSource: null })).toBe(false);
  });

  test("matches current week ymd", () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + diffToMonday);
    const ymd = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(
      monday.getDate()
    ).padStart(2, "0")}`;

    expect(isCurrentWeek(ymd)).toBe(true);
  });
});