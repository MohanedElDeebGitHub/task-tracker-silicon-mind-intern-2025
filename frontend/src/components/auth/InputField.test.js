import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from './InputField';

// Mock CSS imports
jest.mock('../../styles/auth.css', () => ({}));
jest.mock('bootstrap-icons/font/bootstrap-icons.css', () => ({}));

describe('InputField', () => {
  const defaultProps = {
    type: 'text',
    placeholder: 'Enter text',
    value: '',
    onChange: jest.fn(),
    icon: 'username'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field with correct props', () => {
    render(<InputField {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('');
  });

  test('displays correct icon based on icon prop', () => {
    const { container } = render(<InputField {...defaultProps} icon="email" />);
    
    const icon = container.querySelector('.bi-envelope');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('input-icon');
  });

  test('displays username icon', () => {
    const { container } = render(<InputField {...defaultProps} icon="username" />);
    
    const icon = container.querySelector('.bi-person');
    expect(icon).toBeInTheDocument();
  });

  test('displays password icon', () => {
    const { container } = render(<InputField {...defaultProps} icon="password" />);
    
    const icon = container.querySelector('.bi-lock');
    expect(icon).toBeInTheDocument();
  });

  test('calls onChange when input value changes', () => {
    const mockOnChange = jest.fn();
    render(<InputField {...defaultProps} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  test('displays error message when error prop is provided', () => {
    const errorMessage = 'This field is required';
    render(<InputField {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('is-invalid');
  });

  test('does not display error when error prop is not provided', () => {
    render(<InputField {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).not.toHaveClass('is-invalid');
  });

  test('renders with different input types', () => {
    const { rerender } = render(<InputField {...defaultProps} type="password" />);
    let input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveAttribute('type', 'password');

    rerender(<InputField {...defaultProps} type="email" />);
    input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveAttribute('type', 'email');
  });

  test('displays current value', () => {
    render(<InputField {...defaultProps} value="test value" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveValue('test value');
  });

  test('has correct CSS classes', () => {
    const { container } = render(<InputField {...defaultProps} />);
    
    const wrapper = container.querySelector('.input-wrapper');
    expect(wrapper).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('input-with-icon');
  });
});
