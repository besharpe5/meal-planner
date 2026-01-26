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
  "https://mealplanned.io",
  "https://www.mealplanned.io",
  "https://meal-planned.vercel.app", // optional while testing
  process.env.CLIENT_URL,            // keep if you want one configurable origin
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman/curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // IMPORTANT: you're using Bearer tokens, not cookies
  })
);

// Handle preflight for all routes
app.options("*", cors());


app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/user", userRoutes);

app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));


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



