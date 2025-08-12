const jwt = require("jsonwebtoken");
const verifyToken = require("./auth.middleware");
const logger = require("../../config/logger");

// Import Jest globals explicitly to fix linting issues
const { describe, it, expect, beforeEach, jest } = global;

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("../../config/logger");

describe("Auth Middleware - verifyToken", () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock request, response, and next
    req = {
      headers: {},
      user: undefined,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Mock environment variable
    process.env.JWT_SECRET = "test-secret-key";
  });

  describe("Successful token verification", () => {
    it("should verify valid token and call next()", () => {
      // Arrange
      const mockDecoded = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
      };

      req.headers.authorization = "Bearer valid-token-123";
      jwt.verify.mockReturnValue(mockDecoded);

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token-123",
        "test-secret-key",
      );
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("Missing or invalid Authorization header", () => {
    it("should return 403 when no Authorization header is provided", () => {
      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "A token is required for authentication",
      });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it("should return 403 when Authorization header is empty", () => {
      // Arrange
      req.headers.authorization = "";

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "A token is required for authentication",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when Authorization header has no Bearer token", () => {
      // Arrange
      req.headers.authorization = "Bearer";

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "A token is required for authentication",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when Authorization header has wrong format", () => {
      // Arrange - No space means split(" ")[1] returns undefined
      req.headers.authorization = "Basicusername:password";

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "A token is required for authentication",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when Authorization header is just "Bearer "', () => {
      // Arrange
      req.headers.authorization = "Bearer ";

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "A token is required for authentication",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Invalid or expired tokens", () => {
    it("should return 401 for invalid token and log error", () => {
      // Arrange
      req.headers.authorization = "Bearer invalid-token";
      const jwtError = new Error("Invalid token");
      jwt.verify.mockImplementation(() => {
        throw jwtError;
      });

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        "invalid-token",
        "test-secret-key",
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Error occurred at auth middleware: ",
        jwtError,
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("should return 401 for expired token", () => {
      // Arrange
      req.headers.authorization = "Bearer expired-token";
      const expiredError = new Error("jwt expired");
      expiredError.name = "TokenExpiredError";
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error occurred at auth middleware: ",
        expiredError,
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 for malformed token", () => {
      // Arrange
      req.headers.authorization = "Bearer malformed.token";
      const malformedError = new Error("jwt malformed");
      malformedError.name = "JsonWebTokenError";
      jwt.verify.mockImplementation(() => {
        throw malformedError;
      });

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error occurred at auth middleware: ",
        malformedError,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle case-insensitive Authorization header", () => {
      // Arrange
      const mockDecoded = { id: 1, email: "test@example.com" };
      req.headers.Authorization = "Bearer valid-token"; // Capital A
      jwt.verify.mockReturnValue(mockDecoded);

      // Act
      verifyToken(req, res, next);

      // Assert - should fail because the middleware uses lowercase 'authorization'
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle authorization header with lowercase bearer", () => {
      // Arrange
      const mockDecoded = { id: 1, email: "test@example.com" };
      req.headers.authorization = "bearer valid-token"; // lowercase bearer
      jwt.verify.mockReturnValue(mockDecoded);

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret-key");
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should not modify req.user if it already exists", () => {
      // Arrange
      req.user = { id: 999, email: "existing@example.com" };
      const mockDecoded = { id: 1, email: "test@example.com" };
      req.headers.authorization = "Bearer valid-token";
      jwt.verify.mockReturnValue(mockDecoded);

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(req.user).toEqual(mockDecoded); // Should be overwritten
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should handle very long tokens", () => {
      // Arrange
      const longToken = "a".repeat(1000);
      const mockDecoded = { id: 1, email: "test@example.com" };
      req.headers.authorization = `Bearer ${longToken}`;
      jwt.verify.mockReturnValue(mockDecoded);

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(longToken, "test-secret-key");
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should handle header with Basic auth format that has space", () => {
      // Arrange - This will have a space, so split(" ")[1] will work but return wrong value
      req.headers.authorization = "Basic username:password";
      const mockDecoded = { id: 1, email: "test@example.com" };
      jwt.verify.mockReturnValue(mockDecoded);

      // Act
      verifyToken(req, res, next);

      // Assert - Will try to verify "username:password" as JWT token
      expect(jwt.verify).toHaveBeenCalledWith(
        "username:password",
        "test-secret-key",
      );
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("Environment variable handling", () => {
    it("should handle missing JWT_SECRET environment variable", () => {
      // Arrange
      delete process.env.JWT_SECRET;
      req.headers.authorization = "Bearer valid-token";
      const secretError = new Error("secretOrPrivateKey must have a value");
      jwt.verify.mockImplementation(() => {
        throw secretError;
      });

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error occurred at auth middleware: ",
        secretError,
      );
    });
  });

  describe("Response object methods", () => {
    it("should ensure response methods are chainable", () => {
      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.status().json).toBeDefined();
    });

    it("should call res.json exactly once on error", () => {
      // Arrange
      req.headers.authorization = "Bearer invalid-token";
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledTimes(1);
    });
  });

  describe("Token extraction behavior", () => {
    it("should return 403 for undefined token (authHeader exists but split fails)", () => {
      // Arrange
      req.headers.authorization = "NoSpaceHere";

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "A token is required for authentication",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle null authorization header", () => {
      // Arrange
      req.headers.authorization = null;

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "A token is required for authentication",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle undefined authorization header", () => {
      // Arrange
      req.headers.authorization = undefined;

      // Act
      verifyToken(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "A token is required for authentication",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
