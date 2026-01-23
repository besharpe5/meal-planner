const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // day at midnight
    meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", default: null },
    notes: { type: String, default: "" }, // optional future use
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    weekStart: { type: Date, required: true }, // Monday at midnight (or Sunday—pick one)
    days: { type: [daySchema], default: [] },
    family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Ensure one plan per family per weekStart
mealPlanSchema.index({ family: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("MealPlan", mealPlanSchema);
