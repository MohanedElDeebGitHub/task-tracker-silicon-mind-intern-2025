import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock CSS imports
jest.mock('./App.css', () => ({}));

describe('App', () => {
  test('renders App component', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
