import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const MockComponent = () => <div data-testid="protected-content">Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders children when user is authenticated', () => {
    // Set up authentication token
    localStorage.setItem('authToken', 'fake-jwt-token');
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    // Ensure no token is present
    localStorage.removeItem('authToken');
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // The protected content should not be rendered
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('redirects when token is null', () => {
    localStorage.setItem('authToken', null);
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('redirects when token is empty string', () => {
    localStorage.setItem('authToken', '');
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('works with valid token values', () => {
    const validTokens = ['jwt-token-123', 'Bearer token', 'session-12345'];
    
    validTokens.forEach(token => {
      localStorage.setItem('authToken', token);
      
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      screen.getByTestId('protected-content').remove();
    });
  });
});
