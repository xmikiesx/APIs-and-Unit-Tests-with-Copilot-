const request = require("supertest");
const app = require("../app");
const { generateToken } = require("../middleware/auth");

describe("Users API with Pagination and Filters", () => {
  let validToken;

  beforeAll(() => {
    // Generate a valid token for testing protected routes
    validToken = generateToken({ id: 1, username: "testuser" });
  });

  describe("GET /users (List users with pagination and filters)", () => {
    it("should return users with default pagination", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(10); // Default limit
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.offset).toBe(0);
      expect(response.body.pagination.currentPage).toBe(1);
    });

    it("should respect custom limit parameter", async () => {
      const response = await request(app)
        .get("/users?limit=5")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.limit).toBe(5);
    });

    it("should respect offset parameter for pagination", async () => {
      const response = await request(app)
        .get("/users?limit=3&offset=3")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.offset).toBe(3);
      expect(response.body.pagination.currentPage).toBe(2);
    });

    it("should enforce maximum limit of 100", async () => {
      const response = await request(app)
        .get("/users?limit=200")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(100);
    });

    it("should filter users by admin role", async () => {
      const response = await request(app)
        .get("/users?role=admin")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.filters.role).toBe("admin");

      // All returned users should have admin role
      response.body.data.forEach((user) => {
        expect(user.role).toBe("admin");
      });
    });

    it("should filter users by user role", async () => {
      const response = await request(app)
        .get("/users?role=user")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.filters.role).toBe("user");

      // All returned users should have user role
      response.body.data.forEach((user) => {
        expect(user.role).toBe("user");
      });
    });

    it("should return error for invalid role filter", async () => {
      const response = await request(app)
        .get("/users?role=invalid")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid role filter");
    });

    it("should combine pagination and filtering", async () => {
      const response = await request(app)
        .get("/users?role=admin&limit=2&offset=1")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.offset).toBe(1);
      expect(response.body.filters.role).toBe("admin");

      // All returned users should have admin role
      response.body.data.forEach((user) => {
        expect(user.role).toBe("admin");
      });
    });

    it("should include correct pagination metadata", async () => {
      const response = await request(app)
        .get("/users?limit=5")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toMatchObject({
        currentPage: expect.any(Number),
        totalPages: expect.any(Number),
        totalCount: expect.any(Number),
        limit: 5,
        offset: 0,
        hasNext: expect.any(Boolean),
        hasPrevious: false,
      });
    });

    it("should handle edge case with offset beyond total count", async () => {
      const response = await request(app)
        .get("/users?offset=1000")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0); // No users beyond total count
    });

    it("should deny access without token", async () => {
      const response = await request(app).get("/users");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access denied. No token provided.");
    });

    it("should return users with all required fields", async () => {
      const response = await request(app)
        .get("/users?limit=1")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);

      const user = response.body.data[0];
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("role");
      expect(["admin", "user"]).toContain(user.role);
    });
  });
});
