const { User, findOneByEmail, findOneByUsername, create, getUser } = require('./user.model');
const { sequelize } = require('../config/db');

// Import Jest globals explicitly to fix linting issues
const { describe, it, expect, afterAll, beforeEach } = global;

describe('User Model', () => {
  // Generate unique test identifiers
  const testId = Math.random().toString(36).substring(2, 8);
  
  const testUser = {
    username: `usermodeltest_${testId}`,
    email: `usermodel_${testId}@example.com`,
    password: 'password123'
  };

  // Clean up after all tests
  afterAll(async () => {
    try {
      // Clean up users
      await User.destroy({ where: { username: testUser.username } });
      await User.destroy({ where: { email: testUser.email } });
      
      // Close database connection
      await sequelize.close();
      
      console.log('✅ Test cleanup complete');
    } catch (error) {
      console.error('❌ Test cleanup failed:', error);
    }
  });

  // Clean up before each test
  beforeEach(async () => {
    try {
      // Clean up users
      await User.destroy({ where: { username: testUser.username } });
      await User.destroy({ where: { email: testUser.email } });
    } catch (error) {
      console.error('❌ Test setup failed:', error);
    }
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const user = await create(testUser.username, testUser.email, testUser.password);
      
      expect(user).toBeTruthy();
      expect(user.id).toBeTruthy();
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
      expect(user.password).not.toBe(testUser.password); // Password should be hashed
      expect(user.created_at).toBeTruthy();
    });

    it('should fail if username already exists', async () => {
      // Create first user
      await create(testUser.username, testUser.email, testUser.password);
      
      // Try to create another user with same username
      try {
        await create(testUser.username, `another_${testId}@example.com`, 'different123');
        // If we get here without an error, fail the test
        expect('This line should not be reached').toBe('Error should have been thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should fail if email already exists', async () => {
      // Create first user
      await create(testUser.username, testUser.email, testUser.password);
      
      // Try to create another user with same email
      try {
        await create(`another_${testId}`, testUser.email, 'different123');
        // If we get here without an error, fail the test
        expect('This line should not be reached').toBe('Error should have been thrown');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('findOneByUsername', () => {
    it('should find a user by username', async () => {
      // Create a user first
      await create(testUser.username, testUser.email, testUser.password);
      
      // Find the user
      const user = await findOneByUsername(testUser.username);
      
      expect(user).toBeTruthy();
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
    });

    it('should return null for non-existent username', async () => {
      const user = await findOneByUsername('nonexistentuser');
      expect(user).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    it('should find a user by email', async () => {
      // Create a user first
      await create(testUser.username, testUser.email, testUser.password);
      
      // Find the user
      const user = await findOneByEmail(testUser.email);
      
      expect(user).toBeTruthy();
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await findOneByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should authenticate a user with correct credentials', async () => {
      // Create a user first
      await create(testUser.username, testUser.email, testUser.password);
      
      // Authenticate
      const user = await getUser(testUser.email, testUser.password);
      
      expect(user).toBeTruthy();
      expect(user.username).toBe(testUser.username);
      expect(user.email).toBe(testUser.email);
    });

    it('should return null for incorrect password', async () => {
      // Create a user first
      await create(testUser.username, testUser.email, testUser.password);
      
      // Try to authenticate with wrong password
      const user = await getUser(testUser.email, 'wrongpassword');
      
      expect(user).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      const user = await getUser('nonexistent@example.com', 'anypassword');
      expect(user).toBeNull();
    });
  });
});
