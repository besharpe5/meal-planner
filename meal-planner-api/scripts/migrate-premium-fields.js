/**
 * One-off migration: backfill premium fields on existing users.
 *
 * Mongoose defaults handle reads, but this ensures the fields are
 * explicitly stored in the DB for clean queries and indexes.
 *
 * Usage:
 *   MONGO_URI=mongodb+srv://... node scripts/migrate-premium-fields.js
 */

const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI env var is required");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const result = await mongoose.connection.db.collection("users").updateMany(
    { isPremium: { $exists: false } },
    {
      $set: {
        isPremium: false,
        premiumStartedAt: null,
        premiumExpiresAt: null,
        premiumSource: null,
      },
    }
  );

  console.log(`Updated ${result.modifiedCount} users (${result.matchedCount} matched)`);

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
