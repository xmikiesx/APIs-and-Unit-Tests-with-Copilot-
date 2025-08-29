const request = require("supertest");
const app = require("../app");
const { generateToken } = require("../middleware/auth");

describe("JWT Authentication Middleware", () => {
  let validToken;

  beforeAll(() => {
    // Generate a valid token for testing
    validToken = generateToken({ id: 1, username: "testuser" });
  });

  describe("POST /auth/login", () => {
    it("should return a token for valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        username: "testuser",
        password: "testpass",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.message).toBe("Login successful");
    });

    it("should return 400 for missing credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        username: "testuser",
        // missing password
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Username and password are required");
    });
  });

  describe("GET /auth/profile (Protected Route)", () => {
    it("should allow access with valid token", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body.message).toBe("Profile accessed successfully");
    });

    it("should deny access without token", async () => {
      const response = await request(app).get("/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access denied. No token provided.");
    });

    it("should deny access with invalid token", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid token.");
    });

    it("should deny access with malformed authorization header", async () => {
      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", "InvalidFormat");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access denied. No token provided.");
    });
  });

  describe("GET /users/:id (Protected Route)", () => {
    it("should allow access with valid token", async () => {
      const response = await request(app)
        .get("/users/1")
        .set("Authorization", `Bearer ${validToken}`);

      // Status depends on userController implementation
      // but should not be 401 (authentication error)
      expect(response.status).not.toBe(401);
    });

    it("should deny access without token", async () => {
      const response = await request(app).get("/users/1");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access denied. No token provided.");
    });
  });

  describe("POST /users (Public Route)", () => {
    it("should allow access without token", async () => {
      const response = await request(app).post("/users").send({
        name: "Test User",
        email: "test@example.com",
      });

      // Status depends on userController implementation
      // but should not be 401 (authentication error)
      expect(response.status).not.toBe(401);
    });
  });
});
