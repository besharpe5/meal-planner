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

const allowedOrigins = ["http://localhost:5173", ...envClientUrls];

// Optional: allow Vercel preview deployments
const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (vercelPreviewRegex.test(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const corsMiddleware = cors(corsOptions);
app.use(corsMiddleware);
app.options("/*", corsMiddleware); // ✅ no PathError

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/user", userRoutes);

app.get("/health", (req, res) => res.status(200).json({ ok: true }));
app.get("/", (req, res) => res.send("Meal Planner API Running"));

const PORT = Number(process.env.PORT || 8080);

// ✅ Start listening immediately for Cloud Run
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on ${PORT}`);
  console.log("CORS allowedOrigins:", allowedOrigins);
});

// ✅ Connect DB after server is up
connectDB()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection failed:", err?.message || err));

process.on("unhandledRejection", (err) => console.error("unhandledRejection", err));
process.on("uncaughtException", (err) => console.error("uncaughtException", err));
