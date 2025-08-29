const express = require("express");
const router = express.Router();
const { getMetrics } = require("../middleware/metrics");

/**
 * GET /metrics
 * Returns API usage statistics including:
 * - Total requests
 * - Average response time
 * - Most consulted endpoint
 * - Detailed endpoint statistics
 */
router.get("/", getMetrics);

module.exports = router;
