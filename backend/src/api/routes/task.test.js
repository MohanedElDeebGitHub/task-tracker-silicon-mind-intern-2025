const request = require('supertest');
const express = require('express');
const authRoutes = require('./auth.routes.js');
const taskRoutes = require('./task.routes.js');
const { pool } = require('../../config/db.js');

// Setup a test Express app that includes both routers
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// --- Test Suite for Task Management ---

describe('Task Routes', () => {
  let token;
  let userId;
  let taskId;

  const testUser = {
    username: `taskuser_${Date.now()}`,
    email: `taskuser_${Date.now()}@example.com`,
    password: 'password123',
  };

  // Before any tests run, create a user and log them in to get a token
  beforeAll(async () => {
    // Register the user
    const registerRes = await request(app).post('/api/auth/register').send(testUser);
    userId = registerRes.body.user.id;

    // Log in to get the token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    token = loginRes.body.token;
  });

  // After all tests are finished, clean up the database
  afterAll(async () => {
    await pool.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    pool.end();
  });

  it('POST /api/tasks - should create a new task for the authenticated user', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`) // Use the token for authentication
      .send({ title: 'My First Test Task', description: 'This is a test' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('My First Test Task');
    taskId = res.body.id; // Save the ID for later tests
  });

  it('GET /api/tasks - should get all tasks for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/tasks/:id - should get a single task by its ID', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(taskId);
  });

  it('PUT /api/tasks/:id - should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Task Title', status: 'in-progress' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Task Title');
    expect(res.body.status).toBe('in-progress');
  });

  it('DELETE /api/tasks/:id - should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');

    // Verify the task is actually gone
    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toBe(404);
  });

  it('should return 401 for requests without a token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(403); // Or 401 depending on your middleware's response
  });
});