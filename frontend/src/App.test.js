import { render, screen } from "@testing-library/react";
import { MemoryRouter } from 'react-router-dom';
import App from "./App";

// Mock CSS imports
jest.mock('./styles/auth.css', () => ({}));
jest.mock('./styles/dashboard.css', () => ({}));

describe('App Component', () => {
  test('renders LoginPage on default route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    // Check if login form is rendered
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  test('renders SignupPage on /register route', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    
    // Check if signup form is rendered
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  test('renders DashboardPage on /dashboard route when authenticated', () => {
    // Set up authentication token
    localStorage.setItem('authToken', 'fake-jwt-token');
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    
    // Dashboard should be rendered (though it may redirect if not authenticated)
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Clean up
    localStorage.clear();
  });
});
