import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SignupPage } from './SignupPage'; // Assuming SignupPage is a named export

// --- Mocks ---

// 1. Mock react-router to control the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// 2. Mock child components to isolate the SignupPage
jest.mock('../components/auth/BrandingPanel', () => () => <div data-testid="branding-panel" />);
jest.mock('../components/auth/SignupForm', () => 
  ({ handleSignup, username, setUsername, email, setEmail, password, setPassword, isLoading, error, signupSuccess }) => (
    <form data-testid="signup-form" onSubmit={handleSignup}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
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
        {isLoading ? 'Loading...' : 'Sign Up'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
      {signupSuccess && <div data-testid="success-message">Sign Up Successful</div>}
    </form>
));

// 3. Mock CSS imports
jest.mock('../styles/auth.css', () => ({}));

// 4. Mock the global fetch API
global.fetch = jest.fn();

// --- Test Suite ---

describe('SignupPage', () => {

  // Before each test, clear all mocks to ensure a clean slate
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  test('handles successful signup and navigation', async () => {
    // Arrange: Set up the mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered successfully' }),
    });

    render(<SignupPage />);

    // Act: Simulate user typing and submitting the form
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(screen.getByTestId('signup-form'));

    // Assert: Check that the component behaves as expected
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      // Check that the user is redirected
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    // Check that the success message is shown
    expect(screen.getByTestId('success-message')).toBeInTheDocument();
  });

  test('handles failed signup (e.g., user exists) and displays an error', async () => {
    // Arrange: Set up the mock failed API response
    const errorMessage = 'User already exists';
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    render(<SignupPage />);

    // Act: Simulate form submission
    fireEvent.submit(screen.getByTestId('signup-form'));

    // Assert: Check that the error is displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
    });

    // Assert that navigation was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles network errors during fetch', async () => {
    // Arrange: Simulate a network failure
    const networkError = 'Network request failed';
    fetch.mockRejectedValueOnce(new Error(networkError));

    render(<SignupPage />);

    // Act: Simulate form submission
    fireEvent.submit(screen.getByTestId('signup-form'));

    // Assert: Check that the network error is displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(networkError);
    });
  });
});
