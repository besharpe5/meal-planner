const mongoose = require("mongoose");
const crypto = require("crypto");

const inviteSchema = new mongoose.Schema({
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(16).toString("hex"),
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "revoked"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Invite", inviteSchema);
