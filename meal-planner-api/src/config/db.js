const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME; // <- add this

    if (!uri) throw new Error("MONGO_URI missing");
    if (!dbName) throw new Error("MONGO_DB_NAME missing");

    const conn = await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host} → DB: ${dbName}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // fail fast
  }
};

module.exports = connectDB;
