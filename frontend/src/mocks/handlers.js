import { rest } from 'msw';

// This file will contain all the mock API request handlers.
export const handlers = [
  // Mock the login request
  rest.post('http://localhost:3001/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Login successful.',
        username: 'testuser',
        token: 'mocked-jwt-token',
      })
    );
  }),

  // Mock the get tasks request
  rest.get('http://localhost:3001/api/tasks', (req, res, ctx) => {
    // Check if the user is authenticated via the header
    if (req.headers.get('Authorization') === 'Bearer mocked-jwt-token') {
      return res(
        ctx.status(200),
        ctx.json([
          { id: 1, title: 'Mocked Task 1', status: 'to-do' },
          { id: 2, title: 'Mocked Task 2', status: 'in progress' },
        ])
      );
    } else {
      // If no token, return an unauthorized error
      return res(ctx.status(401));
    }
  }),
];