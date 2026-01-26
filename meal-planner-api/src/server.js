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

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/user", userRoutes);

app.get("/health", (req, res) => res.status(200).json({ ok: true }));

const PORT = process.env.PORT || 5001;

// Connect DB first, THEN start server
connectDB().then(() => {
  app.get("/", (req, res) => {
    res.send("Meal Planner API Running");
  });

  app.listen(PORT, () => {
    console.log(`API listening on ${PORT}`);
  });
});



