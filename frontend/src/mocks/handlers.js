import { rest } from 'msw';

// Mock data store for tasks
let mockTasks = [
  { 
    id: 1, 
    title: 'Complete MSW setup', 
    description: 'Set up Mock Service Worker for API testing',
    status: 'to-do', 
    user_id: 1,
    created_at: '2025-08-10T10:00:00Z',
    updated_at: '2025-08-10T10:00:00Z'
  },
  { 
    id: 2, 
    title: 'Write unit tests', 
    description: 'Create comprehensive test coverage',
    status: 'in-progress', 
    user_id: 1,
    created_at: '2025-08-10T09:00:00Z',
    updated_at: '2025-08-10T11:00:00Z'
  },
];

let nextTaskId = 3;

// Mock users for authentication
const mockUsers = {
  'testuser@example.com': {
    id: 1,
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
    token: 'fake-jwt-token'
  }
};

export const handlers = [
  // ===== Authentication Endpoints =====
  
  // Login endpoint
  rest.post('http://localhost:3001/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    const user = mockUsers[email];
    if (!user || user.password !== password) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Invalid email or password' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        message: 'Login successful',
        token: user.token,
        username: user.username
      })
    );
  }),

  // Register endpoint
  rest.post('http://localhost:3001/api/auth/register', (req, res, ctx) => {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    if (mockUsers[email]) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'User already exists' })
      );
    }

    // Create new user
    const newUser = {
      id: Object.keys(mockUsers).length + 1,
      username,
      email,
      password,
      token: `fake-jwt-token-${Date.now()}`
    };
    
    mockUsers[email] = newUser;

    return res(
      ctx.status(201),
      ctx.json({
        message: 'User registered successfully',
        id: newUser.id,
        username: newUser.username
      })
    );
  }),

  // ===== Task Management Endpoints =====
  
  // Get all tasks
  rest.get('http://localhost:3001/api/tasks', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Missing or invalid token' })
      );
    }

    // Return all tasks for the authenticated user
    return res(
      ctx.status(200),
      ctx.json(mockTasks)
    );
  }),

  // Get single task by ID
  rest.get('http://localhost:3001/api/tasks/:id', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Missing or invalid token' })
      );
    }

    const taskId = parseInt(req.params.id);
    const task = mockTasks.find(t => t.id === taskId);
    
    if (!task) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Task not found' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json(task)
    );
  }),

  // Create new task
  rest.post('http://localhost:3001/api/tasks', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Missing or invalid token' })
      );
    }

    const { title, description, status } = req.body;
    
    if (!title) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Title is required' })
      );
    }

    const newTask = {
      id: nextTaskId++,
      title,
      description: description || '',
      status: status || 'to-do',
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockTasks.push(newTask);

    return res(
      ctx.status(201),
      ctx.json(newTask)
    );
  }),

  // Update task
  rest.put('http://localhost:3001/api/tasks/:id', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Missing or invalid token' })
      );
    }

    const taskId = parseInt(req.params.id);
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Task not found' })
      );
    }

    const { title, description, status } = req.body;
    
    // Update the task
    const updatedTask = {
      ...mockTasks[taskIndex],
      title: title !== undefined ? title : mockTasks[taskIndex].title,
      description: description !== undefined ? description : mockTasks[taskIndex].description,
      status: status !== undefined ? status : mockTasks[taskIndex].status,
      updated_at: new Date().toISOString()
    };

    mockTasks[taskIndex] = updatedTask;

    return res(
      ctx.status(200),
      ctx.json(updatedTask)
    );
  }),

  // Delete task
  rest.delete('http://localhost:3001/api/tasks/:id', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Missing or invalid token' })
      );
    }

    const taskId = parseInt(req.params.id);
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Task not found' })
      );
    }

    // Remove the task
    mockTasks.splice(taskIndex, 1);

    return res(
      ctx.status(200),
      ctx.json({ message: 'Task deleted successfully' })
    );
  }),
];

// Export utility functions for tests
export const mockDataUtils = {
  // Reset tasks to initial state
  resetTasks: () => {
    mockTasks = [
      { 
        id: 1, 
        title: 'Complete MSW setup', 
        description: 'Set up Mock Service Worker for API testing',
        status: 'to-do', 
        user_id: 1,
        created_at: '2025-08-10T10:00:00Z',
        updated_at: '2025-08-10T10:00:00Z'
      },
      { 
        id: 2, 
        title: 'Write unit tests', 
        description: 'Create comprehensive test coverage',
        status: 'in-progress', 
        user_id: 1,
        created_at: '2025-08-10T09:00:00Z',
        updated_at: '2025-08-10T11:00:00Z'
      },
    ];
    nextTaskId = 3;
  },

  // Get current tasks
  getTasks: () => [...mockTasks],

  // Add a task programmatically
  addTask: (task) => {
    const newTask = {
      id: nextTaskId++,
      user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...task
    };
    mockTasks.push(newTask);
    return newTask;
  },

  // Clear all tasks
  clearTasks: () => {
    mockTasks = [];
  }
};