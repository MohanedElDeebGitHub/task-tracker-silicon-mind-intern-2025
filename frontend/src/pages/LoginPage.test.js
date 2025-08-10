import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

// Mock CSS imports
jest.mock('../styles/auth.css', () => ({}));

// Mock child components to isolate the LoginPage
jest.mock('../components/auth/BrandingPanel', () => () => <div data-testid="branding-panel" />);

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  test('handles successful login with MSW', async () => {
    renderLoginPage();
    
    // Fill in valid credentials
    await userEvent.type(screen.getByLabelText(/email/i), 'testuser@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for successful login
    await waitFor(() => {
      // Check localStorage was set
      expect(localStorage.getItem('authToken')).toBe('fake-jwt-token');
      expect(localStorage.getItem('username')).toBe('testuser');
    });
  });

  test('handles failed login with invalid credentials', async () => {
    renderLoginPage();
    
    // Fill in invalid credentials
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
    
    // Should not set localStorage
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  test('updates form fields when user types', async () => {
    renderLoginPage();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'testpassword');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('testpassword');
  });

  test('sign up link navigates to signup page', () => {
    renderLoginPage();
    
    const signUpLink = screen.getByRole('link', { name: /sign up/i });
    expect(signUpLink).toHaveAttribute('href', '/signup');
  });
});
