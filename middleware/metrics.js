// Simulated metrics data - in a real application, this would be stored in a database or monitoring system
let metricsData = {
  totalRequests: 1247,
  totalResponseTime: 15625, // Total response time in milliseconds
  endpointStats: {
    "GET /users": { count: 423, totalTime: 4230 },
    "POST /users": { count: 156, totalTime: 2340 },
    "GET /users/:id": { count: 312, totalTime: 3432 },
    "POST /auth/login": { count: 198, totalTime: 2970 },
    "GET /auth/profile": { count: 89, totalTime: 890 },
    "GET /metrics": { count: 69, totalTime: 345 },
  },
};

/**
 * Middleware to track API metrics
 * This would typically integrate with a proper monitoring solution in production
 */
const trackMetrics = (req, res, next) => {
  const startTime = Date.now();

  // Continue with the request
  next();

  // After response is sent, update metrics
  res.on("finish", () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const endpoint = `${req.method} ${req.route ? req.route.path : req.path}`;

    // Update total metrics
    metricsData.totalRequests++;
    metricsData.totalResponseTime += responseTime;

    // Update endpoint-specific metrics
    if (!metricsData.endpointStats[endpoint]) {
      metricsData.endpointStats[endpoint] = { count: 0, totalTime: 0 };
    }

    metricsData.endpointStats[endpoint].count++;
    metricsData.endpointStats[endpoint].totalTime += responseTime;
  });
};

/**
 * GET /metrics - Returns API usage statistics
 * Provides total requests, average response time, and most consulted endpoint
 */
const getMetrics = (req, res) => {
  try {
    // Calculate average response time
    const averageResponseTime =
      metricsData.totalRequests > 0
        ? Math.round(metricsData.totalResponseTime / metricsData.totalRequests)
        : 0;

    // Find most consulted endpoint
    let mostConsultedEndpoint = null;
    let maxRequests = 0;

    for (const [endpoint, stats] of Object.entries(metricsData.endpointStats)) {
      if (stats.count > maxRequests) {
        maxRequests = stats.count;
        mostConsultedEndpoint = {
          endpoint: endpoint,
          requests: stats.count,
          averageResponseTime: Math.round(stats.totalTime / stats.count),
        };
      }
    }

    // Prepare detailed endpoint statistics
    const endpointDetails = Object.entries(metricsData.endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        requests: stats.count,
        averageResponseTime: Math.round(stats.totalTime / stats.count),
        percentage: Math.round((stats.count / metricsData.totalRequests) * 100),
      }))
      .sort((a, b) => b.requests - a.requests); // Sort by request count descending

    // Build response
    const metrics = {
      summary: {
        totalRequests: metricsData.totalRequests,
        averageResponseTime: averageResponseTime,
        mostConsultedEndpoint: mostConsultedEndpoint,
      },
      endpointDetails: endpointDetails,
      metadata: {
        generatedAt: new Date().toISOString(),
        description: "API usage metrics and statistics",
      },
    };

    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while generating metrics",
    });
  }
};

/**
 * Reset metrics data (useful for testing)
 */
const resetMetrics = () => {
  metricsData = {
    totalRequests: 0,
    totalResponseTime: 0,
    endpointStats: {},
  };
};

/**
 * Get current metrics data (for testing purposes)
 */
const getCurrentMetricsData = () => {
  return { ...metricsData };
};

module.exports = {
  trackMetrics,
  getMetrics,
  resetMetrics,
  getCurrentMetricsData,
};
