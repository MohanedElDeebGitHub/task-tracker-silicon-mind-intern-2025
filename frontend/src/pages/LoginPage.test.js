import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginPage } from './LoginPage'; // Assuming LoginPage is a named export

// --- Mocks ---

// 1. Mock react-router to control the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// 2. Mock child components to isolate the LoginPage
jest.mock('../components/auth/BrandingPanel', () => () => <div data-testid="branding-panel" />);
jest.mock('../components/auth/LoginForm', () => 
  ({ handleLogin, email, setEmail, password, setPassword, isLoading, error, loginSuccess }) => (
    <form data-testid="login-form" onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
      {loginSuccess && <div data-testid="success-message">Login Successful</div>}
    </form>
));

// 3. Mock CSS imports
jest.mock('../styles/auth.css', () => ({}));

// 4. Mock the global fetch API
global.fetch = jest.fn();

// --- Test Suite ---

describe('LoginPage', () => {

  // Before each test, clear all mocks to ensure a clean slate
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
    // Spy on localStorage.setItem to track its calls
    jest.spyOn(window.localStorage.__proto__, 'setItem');
  });

  test('handles successful login and navigation', async () => {
    // Arrange: Set up the mock successful API response
    const mockToken = 'fake-jwt-token';
    const mockUsername = 'testuser';
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, username: mockUsername }),
    });

    render(<LoginPage />);

    // Act: Simulate user typing and submitting the form
    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByTestId('login-form'));

    // Assert: Check that the component behaves as expected
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      // Check that localStorage was updated
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith('username', mockUsername);
    });

    await waitFor(() => {
      // Check that the user is redirected
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    // Check that the success message is shown
    expect(screen.getByTestId('success-message')).toBeInTheDocument();
  });

  test('handles failed login and displays an error message', async () => {
    // Arrange: Set up the mock failed API response
    const errorMessage = 'Invalid credentials';
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    render(<LoginPage />);

    // Act: Simulate form submission
    fireEvent.submit(screen.getByTestId('login-form'));

    // Assert: Check that the error is displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
    });

    // Assert that navigation and localStorage were NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('handles network errors during fetch', async () => {
    // Arrange: Simulate a network failure
    const networkError = 'Network request failed';
    fetch.mockRejectedValueOnce(new Error(networkError));

    render(<LoginPage />);

    // Act: Simulate form submission
    fireEvent.submit(screen.getByTestId('login-form'));

    // Assert: Check that the network error is displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(networkError);
    });
  });
});
