require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const authRoutes = require("./routes/auth");
const mealRoutes = require("./routes/meals");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plan", require("./routes/plan"));
app.use("/api/user", require("./routes/user"));

// Connect DB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Meal Planner API Running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
