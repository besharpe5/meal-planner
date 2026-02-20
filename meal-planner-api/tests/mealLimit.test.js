const mealLimit = require("../src/middleware/mealLimit");
const Meal = require("../src/models/Meal");

jest.mock("../src/models/Meal", () => ({
  countDocuments: jest.fn(),
}));

describe("mealLimit middleware", () => {
  const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next for family premium users without counting meals", async () => {
    const req = { user: { isFamilyPremium: true, family: "family-1" } };
    const res = createRes();
    const next = jest.fn();

    await mealLimit(req, res, next);

    expect(Meal.countDocuments).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("does not apply to legacy free users", async () => {
    const req = { user: { isPremium: false, premiumSource: null, family: "family-1" } };
    const res = createRes();
    const next = jest.fn();

    await mealLimit(req, res, next);

    expect(Meal.countDocuments).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

    it("does not apply to active trial users", async () => {
    const req = {
      user: {
        isPremium: false,
        premiumSource: "trial",
        hasEverPaid: false,
        premiumExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        family: "family-1",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await mealLimit(req, res, next);

   expect(Meal.countDocuments).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next for restricted free users below the limit", async () => {
    Meal.countDocuments.mockResolvedValue(11);

    const req = {
      user: {
        isPremium: false,
        premiumSource: "trial",
        hasEverPaid: false,
        premiumExpiresAt: new Date(Date.now() - 1000),
        family: "family-1",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await mealLimit(req, res, next);

     expect(Meal.countDocuments).toHaveBeenCalledWith({ family: "family-1", deletedAt: null });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 403 with family meal limit response when restricted free family hits 12", async () => {
    Meal.countDocuments.mockResolvedValue(12);
    getMealCountForFamily.mockResolvedValue(12);

    const req = {
      user: {
        isPremium: false,
        premiumSource: "trial",
        hasEverPaid: false,
        premiumExpiresAt: new Date(Date.now() - 1000),
        family: "family-1",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await mealLimit(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      code: "MEAL_LIMIT_REACHED",
      error: "Family meal limit reached",
      familyMealCount: 12,
      limit: 12,
      message: "Your family has reached the 12-meal limit. Upgrade to Premium for unlimited meals for everyone.",
    });
  });
});