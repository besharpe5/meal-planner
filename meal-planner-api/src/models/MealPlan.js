const mongoose = require("mongoose");

const mealPlanDaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },

    entryType: {
      type: String,
      enum: ["none", "meal", "leftovers"],
      default: "none",
    },

    // Used when entryType === "meal"
    meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", default: null },

    // Used when entryType === "leftovers"
    // Must reference an earlier day in the same week (enforced in route)
    leftoversFrom: { type: Date, default: null },

    // Only meaningful for leftovers: optionally count leftovers as another serving
    countAsServed: { type: Boolean, default: false },

    // Track if this plan day has been "served" (prevents double serve same day)
    servedAt: { type: Date, default: null },

    notes: { type: String, default: "" },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    weekStart: { type: Date, required: true },
    days: { type: [mealPlanDaySchema], default: [] },

    family: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Helpful index: one plan per family per week
mealPlanSchema.index({ family: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("MealPlan", mealPlanSchema);
