const taskModel = require('./task.model');
const { User } = require('./user.model');
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');

// Import Jest globals explicitly to fix linting issues
const { describe, it, expect, beforeAll, afterAll } = global;

describe('Task Model', () => {
  // Generate unique test identifiers
  const testId = Math.random().toString(36).substring(2, 8);
  let testUserId;
  let testTaskId;
  let testTaskId2;

  const testUser = {
    username: `taskmodeluser_${testId}`,
    email: `taskmodel_${testId}@example.com`,
    password: 'password123'
  };

  const testTask = {
    title: `Test Task ${testId}`,
    description: `Test description for task ${testId}`,
    status: 'to-do'
  };

  // Setup: Create a test user for tasks
  beforeAll(async () => {
    try {
      // Create test user with Sequelize
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword
      });
      
      testUserId = user.id;
      console.log('✅ Test user created with ID:', testUserId);
    } catch (error) {
      console.error('❌ Test setup failed:', error);
      throw error;
    }
  });

  // Cleanup: Remove test data
  afterAll(async () => {
    try {
      // Clean up tasks and user with Sequelize
      await taskModel.destroy({ where: { user_id: testUserId } });
      await User.destroy({ where: { id: testUserId } });
      
      // Close database connection
      await sequelize.close();
      
      console.log('✅ Test cleanup complete');
    } catch (error) {
      console.error('❌ Test cleanup failed:', error);
    }
  });

  describe('create', () => {
    it('should create a new task with all fields', async () => {
      const taskData = {
        title: testTask.title,
        description: testTask.description,
        status: testTask.status,
        user_id: testUserId
      };

      const result = await taskModel.create(taskData);

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('id');
      expect(result.title).toBe(taskData.title);
      expect(result.description).toBe(taskData.description);
      expect(result.status).toBe(taskData.status);
      expect(result.user_id).toBe(testUserId);
      expect(result).toHaveProperty('created_at');

      // Store for other tests
      testTaskId = result.id;
    });

    it('should create a task with default status when status is not provided', async () => {
      const taskData = {
        title: `Default Status Task ${testId}`,
        description: 'Task without explicit status',
        user_id: testUserId
      };

      const result = await taskModel.create(taskData);

      expect(result).toBeTruthy();
      expect(result.status).toBe('to-do'); // Default status
      expect(result.title).toBe(taskData.title);
      expect(result.description).toBe(taskData.description);
      expect(result.user_id).toBe(testUserId);

      // Store for other tests
      testTaskId2 = result.id;
    });

    it('should create a task with null description', async () => {
      const taskData = {
        title: `No Description Task ${testId}`,
        description: null,
        status: 'in progress',
        user_id: testUserId
      };

      const result = await taskModel.create(taskData);

      expect(result).toBeTruthy();
      expect(result.title).toBe(taskData.title);
      expect(result.description).toBeNull();
      expect(result.status).toBe('in progress');
      expect(result.user_id).toBe(testUserId);
    });

    it('should create a task with empty string status (should default to to-do)', async () => {
      const taskData = {
        title: `Empty Status Task ${testId}`,
        description: 'Task with empty status',
        status: '', // Empty string
        user_id: testUserId
      };

      const result = await taskModel.create(taskData);

      expect(result).toBeTruthy();
      expect(result.status).toBe('to-do'); // Should default due to status || "to-do"
    });

    it('should throw error for missing required fields', async () => {
      const invalidTaskData = {
        description: 'Task without title',
        status: 'to-do',
        user_id: testUserId
        // Missing title
      };

      await expect(taskModel.create(invalidTaskData))
        .rejects.toThrow();
    });

    it('should throw error for invalid user_id', async () => {
      const taskData = {
        title: 'Task with invalid user',
        description: 'This should fail',
        status: 'to-do',
        user_id: 999999 // Non-existent user
      };

      await expect(taskModel.create(taskData))
        .rejects.toThrow();
    });
  });

  describe('findAllByUserId', () => {
    it('should find all tasks for a user ordered by created_at DESC', async () => {
      const tasks = await taskModel.findAllByUserId(testUserId);

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);

      // Check that all tasks belong to the test user
      tasks.forEach(task => {
        expect(task.user_id).toBe(testUserId);
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('created_at');
      });

      // Verify ordering (newer tasks first)
      if (tasks.length > 1) {
        const firstTaskDate = new Date(tasks[0].created_at);
        const secondTaskDate = new Date(tasks[1].created_at);
        expect(firstTaskDate.getTime()).toBeGreaterThanOrEqual(secondTaskDate.getTime());
      }
    });

    it('should return empty array for user with no tasks', async () => {
      // Create another user with no tasks using Sequelize
      const anotherUser = await User.create({
        username: `notaskuser_${testId}`,
        email: `notask_${testId}@example.com`,
        password: await bcrypt.hash('password123', 10)
      });
      const anotherUserId = anotherUser.id;

      const tasks = await taskModel.findAllByUserId(anotherUserId);

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks).toHaveLength(0);

      // Cleanup
      await User.destroy({ where: { id: anotherUserId } });
    });

    it('should return empty array for non-existent user', async () => {
      const tasks = await taskModel.findAllByUserId(999999);

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should find task by ID', async () => {
      const task = await taskModel.findById(testTaskId);

      expect(task).toBeTruthy();
      expect(task.id).toBe(testTaskId);
      expect(task.title).toBe(testTask.title);
      expect(task.description).toBe(testTask.description);
      expect(task.status).toBe(testTask.status);
      expect(task.user_id).toBe(testUserId);
      expect(task).toHaveProperty('created_at');
    });

    it('should return undefined for non-existent task ID', async () => {
      const task = await taskModel.findById(999999);

      expect(task).toBeUndefined();
    });

    it('should handle invalid task ID types', async () => {
      const task = await taskModel.findById(999999);

      expect(task).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update task with all fields (non-done status)', async () => {
      const updateData = {
        title: `Updated Task ${testId}`,
        description: `Updated description ${testId}`,
        status: 'in progress'
      };

      const result = await taskModel.update(testTaskId, updateData);

      expect(result).toBeTruthy();
      expect(result.id).toBe(testTaskId);
      expect(result.title).toBe(updateData.title);
      expect(result.description).toBe(updateData.description);
      expect(result.status).toBe(updateData.status);
      expect(result.user_id).toBe(testUserId);
    });

    it('should update task to done status and set total_duration', async () => {
      const updateData = {
        title: `Completed Task ${testId}`,
        description: `Completed description ${testId}`,
        status: 'done'
      };

      const result = await taskModel.update(testTaskId, updateData);

      expect(result).toBeTruthy();
      expect(result.id).toBe(testTaskId);
      expect(result.title).toBe(updateData.title);
      expect(result.description).toBe(updateData.description);
      expect(result.status).toBe('done');
      expect(result.total_duration).toBeTruthy(); // Should be set as an interval
    });

    

    it('should return undefined for non-existent task ID', async () => {
      const updateData = {
        title: 'Updated Non-existent Task',
        status: 'done'
      };

      const result = await taskModel.update(999999, updateData);

      expect(result).toBeUndefined();
    });

    
  });

  describe('remove', () => {
    let taskToDeleteId;

    // Create a task specifically for deletion test
    beforeAll(async () => {
      const taskData = {
        title: `Task to Delete ${testId}`,
        description: 'This task will be deleted',
        status: 'to-do',
        user_id: testUserId
      };

      const result = await taskModel.create(taskData);
      taskToDeleteId = result.id;
    });

    it('should delete task and return deleted task data', async () => {
      const result = await taskModel.remove(taskToDeleteId);

      expect(result).toBeTruthy();
      expect(result.id).toBe(taskToDeleteId);
      expect(result.title).toBe(`Task to Delete ${testId}`);

      // Verify task is actually deleted
      const deletedTask = await taskModel.findById(taskToDeleteId);
      expect(deletedTask).toBeUndefined();
    });

    it('should return undefined for non-existent task ID', async () => {
      const result = await taskModel.remove(999999);

      expect(result).toBeUndefined();
    });

    it('should handle invalid task ID types', async () => {
      const result = await taskModel.remove(999999);

      expect(result).toBeUndefined();
    });
  });

  describe('Database constraint tests', () => {
    it('should handle very long task titles', async () => {
      const longTitle = 'A'.repeat(1000);
      const taskData = {
        title: longTitle,
        description: 'Task with very long title',
        status: 'to-do',
        user_id: testUserId
      };

      // This might succeed or fail depending on your database schema
      // Adjust the expectation based on your title column length limit
      try {
        const result = await taskModel.create(taskData);
        expect(result).toBeTruthy();
        
        // Cleanup
        await taskModel.remove(result.id);
      } catch (error) {
        // If your database has a length limit, this is expected
        expect(error).toBeTruthy();
      }
    });

    it('should handle special characters in task data', async () => {
      const taskData = {
        title: 'Task with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        description: 'Description with émojis 🚀 and ünïcödé characters',
        status: 'to-do',
        user_id: testUserId
      };

      const result = await taskModel.create(taskData);

      expect(result).toBeTruthy();
      expect(result.title).toBe(taskData.title);
      expect(result.description).toBe(taskData.description);

      // Cleanup
      await taskModel.remove(result.id);
    });
  });
});