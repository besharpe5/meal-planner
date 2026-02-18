const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const User = require("../models/User");

/**
 * GET /api/user/me
 * Returns current user profile info
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("_id name email family isPremium premiumStartedAt premiumExpiresAt premiumSource hasEverPaid createdAt updatedAt");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/user/email
 * Body: { email, currentPassword }
 */
router.put("/email", auth, async (req, res) => {
  try {
    const { email, currentPassword } = req.body;

    if (!email || !currentPassword) {
      return res.status(400).json({ message: "Email and current password are required." });
    }

    const nextEmail = String(email).trim().toLowerCase();
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect." });

    const existing = await User.findOne({ email: nextEmail });
    if (existing && String(existing._id) !== String(user._id)) {
      return res.status(409).json({ message: "That email is already in use." });
    }

    user.email = nextEmail;
    await user.save();

    res.json({ message: "Email updated", email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/user/password
 * Body: { currentPassword, newPassword }
 */
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect." });

    // prevent re-using the same password
    const same = await bcrypt.compare(newPassword, user.password);
    if (same) {
      return res.status(400).json({ message: "New password must be different than current password." });
    }

    user.password = newPassword; // assumes your User model hashes on save
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
