// Let Copilot help generate the test case structure
const request = require("supertest");
const app = require("../app");
const { generateToken } = require("../middleware/auth");

describe("User API", () => {
  let validToken;

  beforeAll(() => {
    // Generate a valid token for testing protected routes
    validToken = generateToken({ id: 1, username: "testuser" });
  });

  it("should create a user", async () => {
    const res = await request(app)
      .post("/users")
      .send({ name: "Missael", email: "missael@example.com" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(typeof res.body.data.id).toBe("number");
  });

  it("should return a user with valid token", async () => {
    const res = await request(app)
      .get("/users/123")
      .set("Authorization", `Bearer ${validToken}`);
    expect(res.statusCode).toBe(200);
  });

  it("should deny access to user without token", async () => {
    const res = await request(app).get("/users/123");
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Access denied. No token provided.");
  });
});
