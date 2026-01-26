// server.js
require("dotenv").config();

const validateEnv = require("./config/validateEnv");
// validate required env vars early
validateEnv();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const mealRoutes = require("./routes/meals");
const planRoutes = require("./routes/plan");
const userRoutes = require("./routes/user");

const app = express();

/**
 * ----------------- CORS -----------------
 *
 * Supports any of these env vars:
 * - CLIENT_URLS="https://mealplanned.io,https://staging.mealplanned.io"
 * - CLIENT_URL="https://staging.mealplanned.io"
 * - CORS_ORIGIN="https://staging.mealplanned.io"
 */
const rawClientUrls =
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  process.env.CORS_ORIGIN ||
  "";

const envClientUrls = rawClientUrls
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  ...envClientUrls,
];

// Optional: allow Vercel preview deployments if you want
const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server tools where Origin may be undefined
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    if (vercelPreviewRegex.test(origin)) return callback(null, true);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS before routes
app.use(cors(corsOptions));
// Ensure preflight requests succeed
app.options("*", cors(corsOptions));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/user", userRoutes);

app.get("/health", (req, res) => res.status(200).json({ ok: true }));
app.get("/", (req, res) => res.send("Meal Planner API Running"));

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API listening on ${PORT}`);
    console.log("CORS allowedOrigins:", allowedOrigins);
  });
});
