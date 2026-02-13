const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() { return this.authProvider === "local"; }
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  googleId: {
    type: String,
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Family",
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumStartedAt: {
    type: Date,
    default: null,
  },
  premiumExpiresAt: {
    type: Date,
    default: null,
  },
  premiumSource: {
    type: String,
    enum: ["trial", "stripe", "founder_deal"],
    default: null,
  },
  stripeCustomerId: {
    type: String,
    default: null,
    index: true,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
    index: true,
  },
  hasEverPaid: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Password hashing before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
