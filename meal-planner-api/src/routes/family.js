const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Family = require("../models/Family");
const User = require("../models/User");
const Invite = require("../models/Invite");
const Meal = require("../models/Meal");
const { getFamilyPremiumStatus, invalidateFamilyPremiumStatus } = require("../services/familyService");

/**
 * GET /api/family
 * Returns current user's family info + members
 */
router.get("/", auth, async (req, res) => {
  try {
    const family = await Family.findById(req.user.family).populate(
      "members",
      "name email isPremium premiumExpiresAt"
    );
    if (!family) return res.status(404).json({ message: "Family not found" });
    
    const premiumStatus = await getFamilyPremiumStatus(req.user.family);

    res.json({
      ...family.toObject(),
      isPremium: premiumStatus.isPremium,
      premiumMember: premiumStatus.premiumMember,
      premiumExpiresAt: premiumStatus.premiumExpiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/family/name
 * Rename the family
 */
router.put("/name", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required." });
    }

    const family = await Family.findById(req.user.family);
    if (!family) return res.status(404).json({ message: "Family not found" });

    family.name = String(name).trim();
    await family.save();

    res.json({ message: "Family name updated", name: family.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/family/invite
 * Generate a new invite link
 */
router.post("/invite", auth, async (req, res) => {
  try {
    const invite = await Invite.create({
      family: req.user.family,
      createdBy: req.user._id,
    });

    res.status(201).json({
      code: invite.code,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/family/invites
 * List active (pending, non-expired) invites for the family
 */
router.get("/invites", auth, async (req, res) => {
  try {
    const invites = await Invite.find({
      family: req.user.family,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .select("code expiresAt createdAt")
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/family/invite/:code
 * Revoke an invite
 */
router.delete("/invite/:code", auth, async (req, res) => {
  try {
    const invite = await Invite.findOne({
      code: req.params.code,
      family: req.user.family,
    });

    if (!invite) return res.status(404).json({ message: "Invite not found" });

    invite.status = "revoked";
    await invite.save();

    res.json({ message: "Invite revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/family/invite/:code
 * Preview an invite (public — no auth)
 */
router.get("/invite/:code", async (req, res) => {
  try {
    const invite = await Invite.findOne({ code: req.params.code })
      .populate("family", "name")
      .populate("createdBy", "name");

    if (
      !invite ||
      invite.status !== "pending" ||
      invite.expiresAt < new Date()
    ) {
      return res.json({ valid: false });
    }

    const premiumStatus = await getFamilyPremiumStatus(invite.family?._id);

    res.json({
      valid: true,
      familyName: invite.family?.name || "A family",
      inviterName: invite.createdBy?.name || "Someone",
      expiresAt: invite.expiresAt,
      isPremiumFamily: premiumStatus.isPremium,
      joinPremiumMessage: premiumStatus.isPremium
         ? "You'll get Premium features when you join"
        : null,
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/family/invite/:code/accept
 * Accept an invite and join the family
 * Body: { mergeMeals: boolean }
 */
router.post("/invite/:code/accept", auth, async (req, res) => {
  try {
    const invite = await Invite.findOne({ code: req.params.code });

    if (!invite || invite.status !== "pending") {
      return res.status(400).json({ message: "Invite is invalid or already used." });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invite has expired." });
    }

    const user = req.user;
    const oldFamilyId = user.family;
    const newFamilyId = invite.family;

    // Already in this family
    if (String(oldFamilyId) === String(newFamilyId)) {
      return res.status(400).json({ message: "You're already in this family." });
    }

    // Check if user is in a multi-member family
    const oldFamily = await Family.findById(oldFamilyId);
    if (oldFamily && oldFamily.members.length > 1) {
      return res.status(400).json({
        message: "You must leave your current family before joining another.",
      });
    }

    const { mergeMeals } = req.body;

    // Merge meals if requested
    if (mergeMeals) {
      await Meal.updateMany(
        { family: oldFamilyId },
        { family: newFamilyId }
      );
    }

    const joiningWithPremium = user.isPremium && (!user.premiumExpiresAt || user.premiumExpiresAt > new Date());

    // Move user to new family
    user.family = newFamilyId;
    await user.save();

    // Add to new family members
    await Family.findByIdAndUpdate(newFamilyId, {
      $addToSet: { members: user._id },
    });

    // Remove from old family
    if (oldFamily) {
      oldFamily.members = oldFamily.members.filter(
        (m) => String(m) !== String(user._id)
      );
      if (oldFamily.members.length === 0) {
        await Family.findByIdAndDelete(oldFamilyId);
      } else {
        await oldFamily.save();
      }
    }

    // Mark invite as accepted
    invite.status = "accepted";
    invite.usedBy = user._id;
    invite.usedAt = new Date();
    await invite.save();

    invalidateFamilyPremiumStatus(oldFamilyId);
    invalidateFamilyPremiumStatus(newFamilyId);

    // Return new family info
    const newFamily = await Family.findById(newFamilyId).populate(
      "members",
      "name email isPremium premiumExpiresAt"
    );

    const premiumStatus = await getFamilyPremiumStatus(newFamilyId);

    res.json({
     message: joiningWithPremium
        ? `Your Premium subscription now covers ${newFamily?.name || "your family"}!`
        : "Welcome to the family!",
      family: {
        ...newFamily.toObject(),
        isPremium: premiumStatus.isPremium,
        premiumMember: premiumStatus.premiumMember,
        premiumExpiresAt: premiumStatus.premiumExpiresAt,
      }, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/family/leave
 * Leave current family (only if multi-member)
 */
router.post("/leave", auth, async (req, res) => {
  try {
    const family = await Family.findById(req.user.family);
    if (!family) return res.status(404).json({ message: "Family not found" });

    if (family.members.length <= 1) {
      return res.status(400).json({
        message: "You can't leave — you're the only member.",
      });
    }

    const leavingUserName = req.user.name || "A member";
    const wasPremiumMember = req.user.isPremium && (!req.user.premiumExpiresAt || req.user.premiumExpiresAt > new Date());

    // Remove user from old family
    family.members = family.members.filter(
      (m) => String(m) !== String(req.user._id)
    );
    await family.save();

    // Create new solo family
    const newFamily = await Family.create({
      name: "My Family",
      members: [req.user._id],
    });

    req.user.family = newFamily._id;
    await req.user.save();

   invalidateFamilyPremiumStatus(family._id);
    invalidateFamilyPremiumStatus(newFamily._id);

    const oldFamilyStatus = await getFamilyPremiumStatus(family._id);

    res.json({
      message: "You've left the family.",
      family: newFamily,
      familyPremiumNotice: wasPremiumMember && !oldFamilyStatus.isPremium
        ? `Your family no longer has Premium. ${leavingUserName} took their subscription when they left.`
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
