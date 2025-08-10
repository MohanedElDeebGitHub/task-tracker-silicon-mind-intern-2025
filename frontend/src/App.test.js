import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock CSS imports
jest.mock('./App.css', () => ({}));

// Mock react-router-dom since App uses BrowserRouter
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element, path }) => <div data-testid={`route-${path}`}>{element}</div>
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn(),
  Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>
}));

describe('App', () => {
  test('renders App component', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
