require("dotenv").config();

const validateEnv = require("./config/validateEnv");

// Validate required env vars early (and make failures obvious in Cloud Run logs)
console.log("BOOTING src/server.js", new Date().toISOString());
try {
  validateEnv();
  console.log("Env validated OK");
} catch (err) {
  console.error("ENV VALIDATION FAILED:", err?.message || err);
  process.exit(1);
}

/** ----------------- SAFETY GUARD ----------------- */
function enforceMongoEnvSafety() {
  const env = (process.env.NODE_ENV || "").trim();
  const uri = (process.env.MONGO_URI || "").trim();

  if (!env || !uri) {
    throw new Error("Missing NODE_ENV or MONGO_URI");
  }

  // Extract db name from mongodb+srv://.../<db>?...
  const dbName = uri.split("/").pop().split("?")[0];

  const prodDbName = "mealplanner";
  const stagingDbName = "mealplanned_staging";

  // Production must ALWAYS use the prod DB
  if (env === "production" && dbName !== prodDbName) {
    throw new Error(
      `🚨 SAFETY STOP: NODE_ENV=production must use DB (${prodDbName}) but got (${dbName}).`
    );
  }

  // Staging must ALWAYS use the staging DB
  if (env === "staging" && dbName !== stagingDbName) {
    throw new Error(
      `🚨 SAFETY STOP: NODE_ENV=staging must use DB (${stagingDbName}) but got (${dbName}).`
    );
  }

  // Any non-prod env must NEVER touch prod DB
  if (env !== "production" && dbName === prodDbName) {
    throw new Error(
      `🚨 SAFETY STOP: NODE_ENV=${env} is pointing at PROD DB (${prodDbName}).`
    );
  }

  console.log(`[Safety] NODE_ENV=${env} MongoDB db=${dbName}`);
}
enforceMongoEnvSafety();
/** --------------- END SAFETY GUARD --------------- */

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const mealRoutes = require("./routes/meals");
const planRoutes = require("./routes/plan");
const userRoutes = require("./routes/user");
const familyRoutes = require("./routes/family");
const stripeWebhookRoutes = require("./routes/stripeWebhook");
const path = require("path");
const fs = require("fs");

const app = express();

/** ----------------- CORS ----------------- */
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

const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

const corsOptions = {
  origin(origin, cb) {
    // Allow non-browser clients (curl/postman) with no Origin header
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (vercelPreviewRegex.test(origin)) return cb(null, true);

    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const corsMiddleware = cors(corsOptions);
app.use(corsMiddleware);

// ✅ Preflight handler WITHOUT wildcard routes (avoids path-to-regexp crash)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return corsMiddleware(req, res, next);
  next();
});

// ----- Body parsing & cookies -----
app.use("/api/billing/webhook", stripeWebhookRoutes);
app.use(express.json());
app.use(cookieParser());

/** ----------------- Routes ----------------- */
app.get("/health", (req, res) => res.status(200).json({ ok: true }));
app.get("/", (req, res) => res.send("Meal Planner API Running"));

app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/user", userRoutes);
app.use("/api/family", familyRoutes);

/** ----------------- Static client (optional) ----------------- */
const clientDistPath = path.join(__dirname, "../../meal-planner-client/dist/client");
const clientIndexPath = path.join(clientDistPath, "index.html");

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // Serve SPA entry for non-API routes.
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(clientIndexPath);
  });
}

/** ----------------- Boot ----------------- */
const PORT = Number(process.env.PORT || 8080);

// ✅ Start listening immediately (Cloud Run-friendly)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on ${PORT}`);
  console.log("CORS allowedOrigins:", allowedOrigins);

  // Connect DB after server is up
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
