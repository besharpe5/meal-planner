const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Family = require("../models/Family");

module.exports = async function auth(req, res, next) {
  try {
    // Primary: httpOnly cookie. Fallback: Bearer header (migration + API tools)
    const cookieToken = req.cookies?.access_token;
    const header = req.header("Authorization") || "";
    const bearerToken = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    if (!process.env.JWT_SECRET) {
      // Server misconfig; should never happen now that validateEnv runs
      return res.status(500).json({ message: "Server misconfigured (JWT secret missing)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // ✅ Ensure user has a family (auto-heal older accounts)
    if (!user.family) {
      const family = await Family.create({ name: "My Family", members: [user._id] });
      user.family = family._id;
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    // Keep logs lightweight; don't dump tokens
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};