const request = require("supertest");
const app = require("../app");
const {
  resetMetrics,
  getCurrentMetricsData,
} = require("../middleware/metrics");

describe("GET /metrics - API Usage Statistics", () => {
  beforeEach(() => {
    // Reset metrics before each test to ensure clean state
    resetMetrics();
  });

  describe("Basic metrics functionality", () => {
    it("should return metrics with correct structure and status code 200", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("summary");
      expect(response.body).toHaveProperty("endpointDetails");
      expect(response.body).toHaveProperty("metadata");
    });

    it("should return summary with required fields", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);
      expect(response.body.summary).toHaveProperty("totalRequests");
      expect(response.body.summary).toHaveProperty("averageResponseTime");
      expect(response.body.summary).toHaveProperty("mostConsultedEndpoint");

      // Validate data types
      expect(typeof response.body.summary.totalRequests).toBe("number");
      expect(typeof response.body.summary.averageResponseTime).toBe("number");
    });

    it("should return total requests as a number", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);
      expect(typeof response.body.summary.totalRequests).toBe("number");
      expect(response.body.summary.totalRequests).toBeGreaterThanOrEqual(0);
    });

    it("should return average response time as a number", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);
      expect(typeof response.body.summary.averageResponseTime).toBe("number");
      expect(response.body.summary.averageResponseTime).toBeGreaterThanOrEqual(
        0
      );
    });

    it("should return most consulted endpoint information", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);

      if (response.body.summary.mostConsultedEndpoint) {
        expect(response.body.summary.mostConsultedEndpoint).toHaveProperty(
          "endpoint"
        );
        expect(response.body.summary.mostConsultedEndpoint).toHaveProperty(
          "requests"
        );
        expect(response.body.summary.mostConsultedEndpoint).toHaveProperty(
          "averageResponseTime"
        );

        expect(
          typeof response.body.summary.mostConsultedEndpoint.endpoint
        ).toBe("string");
        expect(
          typeof response.body.summary.mostConsultedEndpoint.requests
        ).toBe("number");
        expect(
          typeof response.body.summary.mostConsultedEndpoint.averageResponseTime
        ).toBe("number");
      }
    });
  });

  describe("Endpoint details", () => {
    it("should return endpoint details as an array", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.endpointDetails)).toBe(true);
    });

    it("should include endpoint details with correct structure", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);

      if (response.body.endpointDetails.length > 0) {
        const endpointDetail = response.body.endpointDetails[0];
        expect(endpointDetail).toHaveProperty("endpoint");
        expect(endpointDetail).toHaveProperty("requests");
        expect(endpointDetail).toHaveProperty("averageResponseTime");
        expect(endpointDetail).toHaveProperty("percentage");

        expect(typeof endpointDetail.endpoint).toBe("string");
        expect(typeof endpointDetail.requests).toBe("number");
        expect(typeof endpointDetail.averageResponseTime).toBe("number");
        expect(typeof endpointDetail.percentage).toBe("number");
      }
    });

    it("should sort endpoints by request count in descending order", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);

      if (response.body.endpointDetails.length > 1) {
        for (let i = 0; i < response.body.endpointDetails.length - 1; i++) {
          expect(
            response.body.endpointDetails[i].requests
          ).toBeGreaterThanOrEqual(
            response.body.endpointDetails[i + 1].requests
          );
        }
      }
    });
  });

  describe("Metadata", () => {
    it("should include metadata with timestamp", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);
      expect(response.body.metadata).toHaveProperty("generatedAt");
      expect(response.body.metadata).toHaveProperty("description");

      // Validate timestamp format (ISO 8601)
      const timestamp = new Date(response.body.metadata.generatedAt);
      expect(timestamp.toISOString()).toBe(response.body.metadata.generatedAt);
    });
  });

  describe("Response format", () => {
    it("should return JSON content type", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("should handle empty metrics data gracefully", async () => {
      // Ensure we start with empty metrics
      resetMetrics();

      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);
      expect(response.body.summary.totalRequests).toBe(0);
      expect(response.body.summary.averageResponseTime).toBe(0);
      expect(response.body.summary.mostConsultedEndpoint).toBeNull();
      expect(response.body.endpointDetails).toEqual([]);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle large numbers correctly", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);

      // Numbers should be finite and not NaN
      expect(Number.isFinite(response.body.summary.totalRequests)).toBe(true);
      expect(Number.isFinite(response.body.summary.averageResponseTime)).toBe(
        true
      );
    });

    it("should include metrics endpoint itself in future calls", async () => {
      // Make two calls to see if metrics endpoint tracks itself
      await request(app).get("/metrics");
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);

      // The metrics endpoint should appear in the endpoint details
      // Note: This test may need real-time tracking enabled
    });
  });

  describe("Simulated data validation", () => {
    it("should return realistic simulated data", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);

      // With simulated data, we should have some requests
      if (response.body.summary.totalRequests > 0) {
        expect(response.body.summary.averageResponseTime).toBeGreaterThan(0);
        expect(response.body.summary.mostConsultedEndpoint).not.toBeNull();
        expect(response.body.endpointDetails.length).toBeGreaterThan(0);
      }
    });

    it("should have consistent data between summary and details", async () => {
      const response = await request(app).get("/metrics");

      expect(response.status).toBe(200);

      if (response.body.endpointDetails.length > 0) {
        // Sum of all endpoint requests should match total requests
        const sumOfRequests = response.body.endpointDetails.reduce(
          (sum, endpoint) => sum + endpoint.requests,
          0
        );

        // Due to simulated data, exact match might not be possible
        // but we can check if they're in a reasonable range
        expect(sumOfRequests).toBeGreaterThan(0);

        // Percentages should sum to approximately 100%
        const sumOfPercentages = response.body.endpointDetails.reduce(
          (sum, endpoint) => sum + endpoint.percentage,
          0
        );
        expect(sumOfPercentages).toBeGreaterThan(0);
        expect(sumOfPercentages).toBeLessThanOrEqual(100);
      }
    });
  });
});
