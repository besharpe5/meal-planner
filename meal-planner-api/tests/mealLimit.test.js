const mealLimit = require("../src/middleware/mealLimit");
const { getMealCountForFamily } = require("../src/services/mealCountCache");

jest.mock("../src/services/mealCountCache", () => ({
  getMealCountForFamily: jest.fn(),
}));

describe("mealLimit middleware", () => {
  const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next for premium users without counting meals", async () => {
    const req = { user: { isPremium: true, family: "family-1" } };
    const res = createRes();
    const next = jest.fn();

    await mealLimit(req, res, next);

    expect(getMealCountForFamily).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("does not apply to legacy free users", async () => {
    const req = { user: { isPremium: false, premiumSource: null, family: "family-1" } };
    const res = createRes();
    const next = jest.fn();

    await mealLimit(req, res, next);

    expect(getMealCountForFamily).not.toHaveBeenCalled();
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

    expect(getMealCountForFamily).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next for restricted free users below the limit", async () => {
    getMealCountForFamily.mockResolvedValue(11);

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

     expect(getMealCountForFamily).toHaveBeenCalledWith("family-1");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 403 with MEAL_LIMIT_REACHED when restricted free user hits 12", async () => {
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
      message: "Free tier limited to 12 meals. Upgrade to Premium for unlimited meals.",
    });
  });
});