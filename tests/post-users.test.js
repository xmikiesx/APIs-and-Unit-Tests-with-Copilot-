const request = require("supertest");
const app = require("../app");

describe("POST /users - Unit Tests", () => {
  describe("Successful user creation", () => {
    it("should create a user and return correct status code with user ID", async () => {
      const newUser = {
        name: "John Doe",
        email: "john.doe@example.com",
      };

      const response = await request(app)
        .post("/users")
        .send(newUser)
        .expect("Content-Type", /json/);

      // Validate status code
      expect(response.status).toBe(201);

      // Validate response structure
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");

      // Validate that response contains the ID of the new user
      expect(response.body.data).toHaveProperty("id");
      expect(typeof response.body.data.id).toBe("number");
      expect(response.body.data.id).toBeGreaterThan(0);

      // Validate that all user data is returned correctly
      expect(response.body.data.name).toBe(newUser.name);
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.role).toBe("user"); // Default role

      // Validate success message
      expect(response.body.message).toBe("User created successfully");
    });

    it("should assign incremental IDs to new users", async () => {
      const user1 = {
        name: "Alice Smith",
        email: "alice@example.com",
      };

      const user2 = {
        name: "Bob Johnson",
        email: "bob@example.com",
      };

      // Create first user
      const response1 = await request(app).post("/users").send(user1);

      // Create second user
      const response2 = await request(app).post("/users").send(user2);

      // Validate both have IDs and second ID is greater than first
      expect(response1.body.data.id).toBeDefined();
      expect(response2.body.data.id).toBeDefined();
      expect(response2.body.data.id).toBeGreaterThan(response1.body.data.id);
    });

    it('should assign default role "user" to new users', async () => {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
      };

      const response = await request(app).post("/users").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.data.role).toBe("user");
    });
  });

  describe("Validation and error handling", () => {
    it("should return 400 when name is missing", async () => {
      const incompleteUser = {
        email: "test@example.com",
        // name is missing
      };

      const response = await request(app).post("/users").send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Missing fields");
    });

    it("should return 400 when email is missing", async () => {
      const incompleteUser = {
        name: "Test User",
        // email is missing
      };

      const response = await request(app).post("/users").send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Missing fields");
    });

    it("should return 400 when both name and email are missing", async () => {
      const emptyUser = {};

      const response = await request(app).post("/users").send(emptyUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Missing fields");
    });

    it("should return 400 when name is empty string", async () => {
      const userWithEmptyName = {
        name: "",
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/users")
        .send(userWithEmptyName);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing fields");
    });

    it("should return 400 when email is empty string", async () => {
      const userWithEmptyEmail = {
        name: "Test User",
        email: "",
      };

      const response = await request(app)
        .post("/users")
        .send(userWithEmptyEmail);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing fields");
    });
  });

  describe("Data integrity", () => {
    it("should handle special characters in name and email", async () => {
      const userWithSpecialChars = {
        name: "José María O'Connor",
        email: "jose.maria+test@example-domain.co.uk",
      };

      const response = await request(app)
        .post("/users")
        .send(userWithSpecialChars);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(userWithSpecialChars.name);
      expect(response.body.data.email).toBe(userWithSpecialChars.email);
      expect(response.body.data.id).toBeDefined();
    });

    it("should preserve exact input data in response", async () => {
      const userData = {
        name: "Test User with Spaces",
        email: "Test.Email+Tag@Domain.Com",
      };

      const response = await request(app).post("/users").send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
    });
  });

  describe("Response format validation", () => {
    it("should return JSON response with correct Content-Type", async () => {
      const newUser = {
        name: "JSON Test User",
        email: "json@example.com",
      };

      const response = await request(app).post("/users").send(newUser);

      expect(response.status).toBe(201);
      expect(response.headers["content-type"]).toMatch(/json/);
    });

    it("should return response with all required fields", async () => {
      const newUser = {
        name: "Complete Test User",
        email: "complete@example.com",
      };

      const response = await request(app).post("/users").send(newUser);

      expect(response.status).toBe(201);

      // Check top-level structure
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("data");

      // Check data object structure
      const userData = response.body.data;
      expect(userData).toHaveProperty("id");
      expect(userData).toHaveProperty("name");
      expect(userData).toHaveProperty("email");
      expect(userData).toHaveProperty("role");

      // Check data types
      expect(typeof userData.id).toBe("number");
      expect(typeof userData.name).toBe("string");
      expect(typeof userData.email).toBe("string");
      expect(typeof userData.role).toBe("string");
    });
  });
});
