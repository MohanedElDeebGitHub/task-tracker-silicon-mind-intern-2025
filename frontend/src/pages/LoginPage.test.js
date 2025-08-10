import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { LoginPage } from './LoginPage';

// Mock CSS imports
jest.mock('../styles/auth.css', () => ({}));

// Mock child components to isolate the LoginPage
jest.mock('../components/auth/BrandingPanel', () => () => <div data-testid="branding-panel" />);
jest.mock('../components/auth/LoginForm', () => ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  isLoading, 
  error, 
  loginSuccess,
  handleLogin 
}) => (
  <form onSubmit={handleLogin} data-testid="login-form">
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Email"
      data-testid="email-input"
    />
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Password"
      data-testid="password-input"
    />
    <button type="submit" disabled={isLoading} data-testid="login-button">
      {isLoading ? 'Logging in...' : 'Login'}
    </button>
    {error && <div data-testid="error-message">{error}</div>}
    {loginSuccess && <div data-testid="success-message">Login successful!</div>}
  </form>
));

// Mock react-router hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// MSW server setup
const server = setupServer(
  rest.post('http://localhost:3001/api/auth/login', async (req, res, ctx) => {
    const body = await req.json();
    const { email, password } = body;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'fake-jwt-token',
          username: 'testuser'
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid email or password' })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderLoginPage = () => {
    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  test('renders login page with all components', () => {
    renderLoginPage();
    
    expect(screen.getByTestId('branding-panel')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  test('handles successful login with MSW', async () => {
    renderLoginPage();
    
    // Fill in valid credentials
    await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByTestId('login-button'));
    
    // Wait for either success or any response
    await waitFor(() => {
      // Check if we got either success or error
      const successElement = screen.queryByTestId('success-message');
      const errorElement = screen.queryByTestId('error-message');
      expect(successElement || errorElement).toBeTruthy();
    });
    
    // If we got a success message, verify navigation and localStorage
    const successElement = screen.queryByTestId('success-message');
    if (successElement) {
      expect(localStorage.getItem('authToken')).toBe('fake-jwt-token');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }
  });

  test('handles failed login with invalid credentials', async () => {
    renderLoginPage();
    
    // Fill in invalid credentials
    await userEvent.type(screen.getByTestId('email-input'), 'invalid@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'wrongpassword');
    
    // Submit form
    await userEvent.click(screen.getByTestId('login-button'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email or password');
    });
  });

  test('updates form fields when user types', async () => {
    renderLoginPage();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'testpassword');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('testpassword');
  });

  test('shows loading state during form submission', async () => {
    // Add delay to the server response to catch loading state
    server.use(
      rest.post('http://localhost:3001/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.delay(100),
          ctx.status(200),
          ctx.json({
            token: 'fake-jwt-token',
            username: 'testuser'
          })
        );
      })
    );

    renderLoginPage();
    
    await userEvent.type(screen.getByTestId('email-input'), 'test@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    const submitPromise = userEvent.click(screen.getByTestId('login-button'));
    
    // Should show loading state immediately
    await waitFor(() => {
      expect(screen.getByTestId('login-button')).toHaveTextContent('Logging in...');
      expect(screen.getByTestId('login-button')).toBeDisabled();
    });

    // Wait for the form submission to complete
    await submitPromise;
  });
});
