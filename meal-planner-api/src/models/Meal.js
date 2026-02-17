const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  notes: String,
  timesServed: { type: Number, default: 0 },
  lastServed: Date,
  rating: { type: Number, min: 0, max: 5 },
  deletedAt: { type: Date, default: null },
  family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Meal", mealSchema);
