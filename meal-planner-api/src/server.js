require("dotenv").config();

const validateEnv = require("./config/validateEnv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const mealRoutes = require("./routes/meals");
const planRoutes = require("./routes/plan");
const userRoutes = require("./routes/user");

console.log("BOOTING src/server.js", new Date().toISOString());

// Validate required env vars early (and make failures obvious in Cloud Run logs)
try {
  validateEnv();
  console.log("Env validated OK");
} catch (err) {
  console.error("ENV VALIDATION FAILED:", err?.message || err);
  process.exit(1);
}

const app = express();

// ----- CORS -----
const allowedOrigins = [
  "http://localhost:5173",
  "https://mealplanned.io",
  "https://www.mealplanned.io",
  "https://meal-planned.vercel.app", // optional while testing
  process.env.CLIENT_URL,            // optional configurable origin
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser clients (curl/postman) with no Origin header
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // JWT in Authorization header (no cookies)
};

app.use(cors(corsOptions));

// Express 5 / path-to-regexp note:
// app.options("*", ...) can throw. Instead, handle OPTIONS with middleware:
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ----- Body parsing -----
app.use(express.json());

// ----- Routes -----
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/user", userRoutes);

// Health checks
app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));
app.get("/", (req, res) => res.send("Meal Planner API Running"));

// ----- Start server FIRST (Cloud Run needs PORT listening quickly) -----
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);

  // Connect DB AFTER server is listening so Cloud Run startup probe passes
  connectDB()
    .then(() => console.log("✅ DB connected"))
    .catch((err) => {
      console.error("❌ DB connection failed:", err?.message || err);
      // Optional: process.exit(1);
    });
});

// Optional: surface unexpected errors in logs
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
