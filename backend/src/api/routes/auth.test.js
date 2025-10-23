const request = require("supertest");
const express = require("express");
const authRoutes = require("./auth.routes.js");
const { sequelize } = require("../../config/db.js");
const { User } = require("../../models/user.model.js");
require("dotenv").config();

// Import Jest globals explicitly to fix linting issues
const { describe, it, expect, beforeEach, afterAll } = global;

// Setup a test Express app
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Authentication Routes", () => {
  // Generate timestamp once for consistency
  const timestamp = Math.floor(Math.random() * 1000);

  const testUser = {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: "password123",
  };

  // Clean up before each test to ensure fresh state
  beforeEach(async () => {
    await User.destroy({
      where: {
        email: testUser.email,
      },
    });

    await User.destroy({
      where: {
        username: testUser.username,
      },
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    await User.destroy({
      where: {
        email: testUser.email,
      },
    });

    await User.destroy({
      where: {
        username: testUser.username,
      },
    });

    await sequelize.close();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully and return 201", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      if (res.statusCode !== 201) {
        console.error("❌ Expected 201, got:", res.statusCode);
        console.error("❌ Error details:", res.body);
      }
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe(testUser.email);
    });

    it("should return 409 if the email already exists", async () => {
      // First, create the user
      await request(app).post("/api/auth/register").send(testUser);

      // Then try to create again with same email
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, username: `anotheruser_${timestamp}` });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty("error", "Email already used before.");
    });

    it("should return 409 if the username already exists", async () => {
      // First, create the user
      await request(app).post("/api/auth/register").send(testUser);

      // Then try to create again with same username
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: `anotheremail_${timestamp}@example.com` });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty("error", "Username already exists.");
    });

    it("should return 400 for a weak password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username: `weakuser_${timestamp}`,
          email: `weakpass_${timestamp}@example.com`,
          password: "123",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain(
        "Password must be at least 6 characters",
      );
    });

    it("should return 400 for an invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username: `invaliduser_${timestamp}`,
          email: "not-an-email",
          password: "password123",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid email format.");
    });

    it("should return 400 if a required field is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          username: `baduser_${timestamp}`,
          email: `bad_${timestamp}@example.com`,
          // Password is missing
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "All fields are required.");
    });
  });

  describe("POST /api/auth/login", () => {
    // Create user before each login test
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should log in an existing user and return a JWT token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("message", "Login successful.");
      expect(res.body.username).toBe(testUser.username);
    });

    it("should return 401 for incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid credentials.");
    });

    it("should return 401 for a non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: `nosuchuser_${timestamp}@example.com`,
          password: "password123",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid credentials.");
    });
  });
});
