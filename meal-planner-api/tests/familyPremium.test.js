const {
  getFamilyPremiumStatus,
  clearFamilyPremiumStatusCache,
} = require("../src/services/familyService");

const Family = require("../src/models/Family");

jest.mock("../src/models/Family", () => ({
  findById: jest.fn(),
}));

function mockFamily(members = []) {
  Family.findById.mockReturnValue({
    populate: jest.fn().mockResolvedValue({ members }),
  });
}

describe("familyService premium status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearFamilyPremiumStatusCache();
  });

  test("solo user with premium gives family premium", async () => {
    mockFamily([
      {
        _id: "u1",
        name: "Solo",
        email: "solo@test.com",
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 60_000),
      },
    ]);

    const status = await getFamilyPremiumStatus("fam1");

    expect(status.isPremium).toBe(true);
    expect(status.premiumMember?.name).toBe("Solo");
  });

  test("family with one premium member gives all premium", async () => {
    mockFamily([
      { _id: "u1", name: "Alice", email: "a@test.com", isPremium: true, premiumExpiresAt: new Date(Date.now() + 60_000) },
      { _id: "u2", name: "Bob", email: "b@test.com", isPremium: false, premiumExpiresAt: null },
    ]);

    const status = await getFamilyPremiumStatus("fam2");
    expect(status.isPremium).toBe(true);
    expect(status.premiumMember?.name).toBe("Alice");
  });

  test("family loses premium when paying member cancels", async () => {
    mockFamily([
      { _id: "u1", name: "Alice", email: "a@test.com", isPremium: false, premiumExpiresAt: null },
      { _id: "u2", name: "Bob", email: "b@test.com", isPremium: false, premiumExpiresAt: null },
    ]);

    const status = await getFamilyPremiumStatus("fam3");
    expect(status.isPremium).toBe(false);
    expect(status.premiumMember).toBeNull();
  });

  test("user leaving premium family no longer has family premium", async () => {
    mockFamily([
      { _id: "u5", name: "Leaver", email: "l@test.com", isPremium: false, premiumExpiresAt: null },
    ]);

    const status = await getFamilyPremiumStatus("newSoloFam");
    expect(status.isPremium).toBe(false);
  });
});