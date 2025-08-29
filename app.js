const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const { trackMetrics } = require("./middleware/metrics");

app.use(express.json());

// Optional: Add metrics tracking middleware to all routes
// Uncomment the next line to enable real-time metrics tracking
// app.use(trackMetrics);

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/metrics", metricsRoutes);

module.exports = app;
