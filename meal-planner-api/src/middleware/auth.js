const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Family = require("../models/Family");

module.exports = async function auth(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

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
    console.error(err);
    res.status(401).json({ message: "Token is not valid" });
  }
};
