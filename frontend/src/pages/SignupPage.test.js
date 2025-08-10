import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { rest } from 'msw';
import { server } from '../mocks/server';
import { SignupPage } from './SignupPage';

// Mock CSS imports
jest.mock('../styles/auth.css', () => ({}));

// Mock child components to isolate the SignupPage
jest.mock('../components/auth/BrandingPanel', () => () => <div data-testid="branding-panel" />);
jest.mock('../components/auth/SignupForm', () => (props) => {
  const { username, setUsername, email, setEmail, password, setPassword, isLoading, error, signupSuccess, handleSignup } = props;
  return (
    <form onSubmit={handleSignup} data-testid="signup-form">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        data-testid="username-input"
      />
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
      <button type="submit" disabled={isLoading} data-testid="signup-button">
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
      {signupSuccess && <div data-testid="success-message">Signup successful!</div>}
    </form>
  );
});

// Mock react-router hooks
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // Add custom handlers for this test
    server.use(
      rest.post('http://localhost:3001/api/auth/register', async (req, res, ctx) => {
        const body = await req.json();
        const { username, email, password } = body;
        
        // Check for specific error conditions first
        if (email === 'existing@example.com') {
          return res(
            ctx.status(400),
            ctx.json({ error: 'Email already exists' })
          );
        }
        
        // Check for missing fields
        if (!username || !email || !password) {
          return res(
            ctx.status(400),
            ctx.json({ error: 'All fields are required' })
          );
        }
        
        // Success case
        return res(
          ctx.status(201),
          ctx.json({
            message: 'User created successfully',
            username: username
          })
        );
      })
    );
  });

  const renderSignupPage = () => {
    return render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
  };

  test('renders signup page with all components', () => {
    renderSignupPage();
    
    expect(screen.getByTestId('branding-panel')).toBeInTheDocument();
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-button')).toBeInTheDocument();
  });

  test('handles successful signup with MSW', async () => {
    renderSignupPage();
    
    // Fill in valid user data
    await userEvent.type(screen.getByTestId('username-input'), 'newuser');
    await userEvent.type(screen.getByTestId('email-input'), 'newuser@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByTestId('signup-button'));
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument();
    });
  });

  test('handles failed signup with existing email', async () => {
    renderSignupPage();
    
    // Fill in data with existing email
    await userEvent.type(screen.getByTestId('username-input'), 'testuser');
    await userEvent.type(screen.getByTestId('email-input'), 'existing@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByTestId('signup-button'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Email already exists');
    });
  });

  test('updates form fields when user types', async () => {
    renderSignupPage();
    
    const usernameInput = screen.getByTestId('username-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'testpassword');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('testpassword');
  });

  test('shows loading state during form submission', async () => {
    renderSignupPage();
    
    await userEvent.type(screen.getByTestId('username-input'), 'newuser');
    await userEvent.type(screen.getByTestId('email-input'), 'newuser@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByTestId('signup-button'));
    
    // Should show loading state immediately
    expect(screen.getByTestId('signup-button')).toHaveTextContent('Signing up...');
    expect(screen.getByTestId('signup-button')).toBeDisabled();
  });

  test('handles validation errors', async () => {
    renderSignupPage();
    
    // Fill in invalid data (missing username)
    await userEvent.type(screen.getByTestId('email-input'), 'invalid@example.com');
    await userEvent.type(screen.getByTestId('password-input'), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByTestId('signup-button'));
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });
});
