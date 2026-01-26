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
 * ----------------- CORS (supports localhost + prod + staging) -----------------
 */
const envClientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "https://mealplanned.io",
  "https://www.mealplanned.io",
  "https://staging.mealplanned.io",
  ...envClientUrls,
];

// Optional: allow Vercel preview URLs like https://something.vercel.app
const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    if (vercelPreviewRegex.test(origin)) return callback(null, true);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS BEFORE routes + handle preflight
const corsMiddleware = cors(corsOptions);
app.use(corsMiddleware);
app.options("*", corsMiddleware);

/**
 * ----------------- Middleware -----------------
 */
app.use(express.json());

/**
 * ----------------- Routes -----------------
 */
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/user", userRoutes);

app.get("/health", (req, res) => res.status(200).json({ ok: true }));

/**
 * ----------------- Boot -----------------
 */
const PORT = process.env.PORT || 8080;

// Connect DB first, THEN start server
connectDB().then(() => {
  app.get("/", (req, res) => {
    res.send("Meal Planner API Running");
  });

  app.listen(PORT, () => {
    console.log(`API listening on ${PORT}`);
    console.log("Allowed origins:", allowedOrigins);
  });
});
