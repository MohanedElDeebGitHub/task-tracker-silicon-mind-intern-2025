import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock CSS imports
jest.mock('./App.css', () => ({}));

// Mock react-router-dom since App uses BrowserRouter
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>
}));

describe('App', () => {
  test('renders App component', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
