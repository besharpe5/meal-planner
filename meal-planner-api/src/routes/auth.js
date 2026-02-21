const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { setTokenCookies, clearTokenCookies, hashToken, REFRESH_MAX_AGE } = require("../utils/cookies");
const { getFamilyPremiumStatus } = require("../services/familyService");
const { serializeUser } = require("../utils/userResponse");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../services/emailService");

function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
}

async function createRefreshToken(user) {
  const raw = crypto.randomBytes(40).toString("hex");
  const hashed = hashToken(raw);

  await RefreshToken.create({
    token: hashed,
    user: user._id,
    family: user.family,
    expiresAt: new Date(Date.now() + REFRESH_MAX_AGE),
  });

  return raw;
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, familyName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Create user with 14-day premium trial
    user = new User({ name, email, password });
    user.isPremium = true;
    user.premiumSource = "trial";
    user.premiumStartedAt = new Date();
    user.premiumExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create family if provided
    if (familyName) {
      const Family = require("../models/Family");
      const family = await Family.create({ name: familyName, members: [user._id] });
      user.family = family._id;
    }

    await user.save();

    try {
      await sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr.message);
    }

    const familyPremiumStatus = await getFamilyPremiumStatus(user.family);
    user.isFamilyPremium = familyPremiumStatus.isPremium;
    user.familyPremiumMember = familyPremiumStatus.premiumMember;
    user.familyPremiumExpiresAt = familyPremiumStatus.premiumExpiresAt;

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user);
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: serializeUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Please provide email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.authProvider !== "local")
      return res.status(400).json({ message: `Use ${user.authProvider} to login` });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const familyPremiumStatus = await getFamilyPremiumStatus(user.family);
    user.isFamilyPremium = familyPremiumStatus.isPremium;
    user.familyPremiumMember = familyPremiumStatus.premiumMember;
    user.familyPremiumExpiresAt = familyPremiumStatus.premiumExpiresAt;

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user);
    setTokenCookies(res, accessToken, refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: serializeUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// REFRESH
router.post("/refresh", async (req, res) => {
  try {
    const raw = req.body?.refreshToken || req.cookies?.refresh_token;
    if (!raw) return res.status(401).json({ message: "No refresh token" });

    const hashed = hashToken(raw);
    const storedToken = await RefreshToken.findOne({ token: hashed });

    if (!storedToken) {
      clearTokenCookies(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Reuse detection: if this token was already rotated, someone is using a stolen token
    if (storedToken.replacedBy) {
      // Revoke ALL tokens for this user (nuclear option)
      await RefreshToken.updateMany({ user: storedToken.user }, { revoked: true });
      clearTokenCookies(res);
      return res.status(401).json({ message: "Token reuse detected — all sessions revoked" });
    }

    if (storedToken.revoked || storedToken.expiresAt < new Date()) {
      clearTokenCookies(res);
      return res.status(401).json({ message: "Refresh token expired or revoked" });
    }

    // Load user
    const user = await User.findById(storedToken.user);
    if (!user) {
      clearTokenCookies(res);
      return res.status(401).json({ message: "User not found" });
    }

    // Rotate: issue new tokens, mark old as replaced
    const newAccessToken = generateAccessToken(user._id);
    const newRawRefresh = crypto.randomBytes(40).toString("hex");
    const newHashedRefresh = hashToken(newRawRefresh);

    await RefreshToken.create({
      token: newHashedRefresh,
      user: user._id,
      family: user.family,
      expiresAt: new Date(Date.now() + REFRESH_MAX_AGE),
    });

    storedToken.replacedBy = newHashedRefresh;
    await storedToken.save();

     const familyPremiumStatus = await getFamilyPremiumStatus(user.family);
    user.isFamilyPremium = familyPremiumStatus.isPremium;
    user.familyPremiumMember = familyPremiumStatus.premiumMember;
    user.familyPremiumExpiresAt = familyPremiumStatus.premiumExpiresAt;


    setTokenCookies(res, newAccessToken, newRawRefresh);
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRawRefresh,
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("Refresh error:", err.message);
    clearTokenCookies(res);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    const raw = req.body?.refreshToken || req.cookies?.refresh_token;
    if (raw) {
      const hashed = hashToken(raw);
      await RefreshToken.findOneAndUpdate({ token: hashed }, { revoked: true });
    }

    clearTokenCookies(res);
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err.message);
    clearTokenCookies(res);
    res.json({ message: "Logged out" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });

    // Always respond with 200 to prevent email enumeration
    if (!user || user.authProvider !== "local") {
      return res.json({ message: "If an account exists, a reset email was sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user, rawToken);
    } catch (emailErr) {
      console.error("Password reset email failed:", emailErr.message);
    }

    return res.json({ message: "If an account exists, a reset email was sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = password; // pre-save hook hashes this
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Revoke all sessions for security
    await RefreshToken.updateMany({ user: user._id }, { revoked: true });

    return res.json({ message: "Password reset successfully. Please log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
