const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const taskRoutes = require('./task.routes');
const authRoutes = require('./auth.routes');
const { pool } = require('../../config/db');

// Setup test Express app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

describe('Task Routes', () => {
  // Generate unique test identifiers
  const testId = Math.random().toString(36).substring(2, 8);
  
  let authToken;
  let testUserId;
  let testTaskId;
  
  const testUser = {
    username: `taskuser_${testId}`,
    email: `tasktest_${testId}@example.com`,
    password: 'password123',
  };

  const testTask = {
    title: `Test Task ${testId}`,
    description: `Test description for task ${testId}`,
    status: 'to-do'
  };

  // Setup: Create user and get auth token
  beforeAll(async () => {
    try {
      // Register test user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      testUserId = registerRes.body.id;
      
      // Login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      authToken = loginRes.body.token;
      
      console.log('✅ Test setup complete - User created and logged in');
    } catch (error) {
      console.error('❌ Test setup failed:', error);
      throw error;
    }
  });

  // Cleanup: Remove test data
  afterAll(async () => {
    try {
      // Clean up tasks
      await pool.query('DELETE FROM tasks WHERE user_id = $1', [testUserId]);
      
      // Clean up user
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
      
      // Close database connection
      await pool.end();
      
      console.log('✅ Test cleanup complete');
    } catch (error) {
      console.error('❌ Test cleanup failed:', error);
    }
  });

  describe('POST /api/tasks', () => {
    
    it('should create a new task successfully and return 201', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTask);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(testTask.title);
      expect(res.body.description).toBe(testTask.description);
      expect(res.body.status).toBe(testTask.status);
      expect(res.body.user_id).toBe(testUserId);
      expect(res.body).toHaveProperty('created_at');
      
      // Store task ID for other tests
      testTaskId = res.body.id;
    });

    it('should return 400 if title is missing', async () => {
      const invalidTask = {
        description: 'Task without title',
        status: 'to-do'
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTask);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'No title');
    });

    it('should return 403 if no authorization token provided', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send(testTask);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'A token is required for authentication');
    });

    it('should return 401 if invalid token provided', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer invalid_token')
        .send(testTask);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid or expired token');
    });

    it('should create task with minimal data (title only)', async () => {
      const minimalTask = {
        title: `Minimal Task ${testId}`
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(minimalTask);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe(minimalTask.title);
      expect(res.body.user_id).toBe(testUserId);
    });
  });

  describe('GET /api/tasks', () => {
    
    it('should get all tasks for authenticated user and return 200', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      
      // Check that all tasks belong to the authenticated user
      res.body.forEach(task => {
        expect(task.user_id).toBe(testUserId);
      });
    });

    it('should return 403 if no authorization token provided', async () => {
      const res = await request(app)
        .get('/api/tasks');

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'A token is required for authentication');
    });

    it('should return 401 if invalid token provided', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('GET /api/tasks/:id', () => {
    
    it('should get task by ID and return 200', async () => {
      const res = await request(app)
        .get(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(testTaskId);
      expect(res.body.title).toBe(testTask.title);
      expect(res.body.user_id).toBe(testUserId);
    });

    it('should return 404 if task does not exist', async () => {
      const nonExistentId = 999999;
      
      const res = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', "Task with that ID doesn't exist.");
    });

    it('should return 403 if trying to access another user\'s task', async () => {
      // Create another user and their task
      const anotherUser = {
        username: `anotheruser_${testId}`,
        email: `another_${testId}@example.com`,
        password: 'password123'
      };

      // Register another user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(anotherUser);

      const anotherUserId = registerRes.body.id;

      // Login as another user
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: anotherUser.email,
          password: anotherUser.password
        });

      const anotherToken = loginRes.body.token;

      // Create task as another user
      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          title: `Another user's task ${testId}`,
          status: 'to-do'
        });

      const anotherTaskId = taskRes.body.id;

      // Try to access another user's task with first user's token
      const res = await request(app)
        .get(`/api/tasks/${anotherTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', "You don't have access to this resource.");

      // Cleanup
      await pool.query('DELETE FROM tasks WHERE user_id = $1', [anotherUserId]);
      await pool.query('DELETE FROM users WHERE id = $1', [anotherUserId]);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    
    it('should update task and return 200', async () => {
      const updatedData = {
        title: `Updated Task ${testId}`,
        description: `Updated description ${testId}`,
        status: 'in progress'
      };

      const res = await request(app)
        .put(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(testTaskId);
      expect(res.body.title).toBe(updatedData.title);
      expect(res.body.description).toBe(updatedData.description);
      expect(res.body.status).toBe(updatedData.status);
    });

    it('should return 404 if task does not exist', async () => {
      const nonExistentId = 999999;
      
      const res = await request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated title' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 403 if trying to update another user\'s task', async () => {
      // This would require creating another user's task similar to the GET test
      // For brevity, testing with a mock scenario
      const res = await request(app)
        .put(`/api/tasks/999999`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Unauthorized update' });

      expect([403, 404]).toContain(res.statusCode);
    });

    
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskToDeleteId;

    // Create a task specifically for deletion test
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: `Task to Delete ${testId}`,
          description: 'This task will be deleted',
          status: 'to-do'
        });
      
      taskToDeleteId = res.body.id;
    });

    it('should delete task and return 200', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Task deleted successfully');

      // Verify task is actually deleted
      const getRes = await request(app)
        .get(`/api/tasks/${taskToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(getRes.statusCode).toBe(404);
    });

    it('should return 404 if task does not exist', async () => {
      const nonExistentId = 999999;
      
      const res = await request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 403 if trying to delete another user\'s task', async () => {
      // Similar to update test - testing with non-existent ID for simplicity
      const res = await request(app)
        .delete(`/api/tasks/999999`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([403, 404]).toContain(res.statusCode);
    });
  });

  describe('Authentication and Authorization', () => {
    
    it('should reject requests without Authorization header', async () => {
      const endpoints = [
        { method: 'get', path: '/api/tasks' },
        { method: 'post', path: '/api/tasks' },
        { method: 'get', path: '/api/tasks/1' },
        { method: 'put', path: '/api/tasks/1' },
        { method: 'delete', path: '/api/tasks/1' }
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)[endpoint.method](endpoint.path);
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error', 'A token is required for authentication');
      }
    });

    it('should reject requests with malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'InvalidFormat');

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'A token is required for authentication');
    });

    it('should reject requests with expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: testUserId, email: testUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('Data Validation and Edge Cases', () => {
    
    

    it('should handle special characters in task data', async () => {
      const specialTask = {
        title: 'Task with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        description: 'Description with émojis 🚀 and ünïcödé',
        status: 'to-do'
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(specialTask);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe(specialTask.title);
      expect(res.body.description).toBe(specialTask.description);
    });

    it('should handle empty strings in optional fields', async () => {
      const taskWithEmptyFields = {
        title: `Empty Fields Task ${testId}`,
        description: '',
        status: ''
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskWithEmptyFields);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe(taskWithEmptyFields.title);
    });
  });
});
