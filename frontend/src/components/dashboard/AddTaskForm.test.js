import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTaskForm from './AddTaskForm';

// Mock CSS imports
jest.mock('../../styles/dashboard.css', () => ({}));

describe('AddTaskForm', () => {
  const defaultProps = {
    show: true,
    onHide: jest.fn(),
    onTaskAdded: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'fake-jwt-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders modal when show is true', () => {
    render(<AddTaskForm {...defaultProps} />);
    
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  test('does not render modal when show is false', () => {
    render(<AddTaskForm {...defaultProps} show={false} />);
    
    expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
  });

  test('initializes with correct default values', () => {
    render(<AddTaskForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/status/i)).toHaveValue('to-do');
  });

  test('updates form fields when user types', async () => {
    render(<AddTaskForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    await userEvent.type(titleInput, 'Test Task');
    await userEvent.type(descriptionInput, 'Test Description');
    
    expect(titleInput).toHaveValue('Test Task');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  test('updates status when selected', async () => {
    render(<AddTaskForm {...defaultProps} />);
    
    const statusSelect = screen.getByLabelText(/status/i);
    await userEvent.selectOptions(statusSelect, 'in-progress');
    
    expect(statusSelect).toHaveValue('in-progress');
  });

  test('calls onHide when cancel button is clicked', async () => {
    render(<AddTaskForm {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    
    expect(defaultProps.onHide).toHaveBeenCalledTimes(1);
  });

  test('calls onHide when close button is clicked', async () => {
    render(<AddTaskForm {...defaultProps} />);
    
    const closeButton = screen.getByLabelText(/close/i);
    await userEvent.click(closeButton);
    
    expect(defaultProps.onHide).toHaveBeenCalledTimes(1);
  });

  test('submits form with correct data using MSW', async () => {
    render(<AddTaskForm {...defaultProps} />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/title/i), 'New Task');
    await userEvent.type(screen.getByLabelText(/description/i), 'Task Description');
    await userEvent.selectOptions(screen.getByLabelText(/status/i), 'in-progress');
    
    // Submit the form
    const submitButton = screen.getByText('Add Task');
    await userEvent.click(submitButton);
    
    // Wait for form submission to complete
    await waitFor(() => {
      expect(defaultProps.onTaskAdded).toHaveBeenCalledTimes(1);
      expect(defaultProps.onHide).toHaveBeenCalledTimes(1);
    });
  });

  test('shows loading state during form submission', async () => {
    render(<AddTaskForm {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/title/i), 'New Task');
    
    const submitButton = screen.getByText('Add Task');
    await userEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('prevents submission with empty title', async () => {
    render(<AddTaskForm {...defaultProps} />);
    
    // Try to submit without title
    const submitButton = screen.getByText('Add Task');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    
    expect(defaultProps.onTaskAdded).not.toHaveBeenCalled();
    expect(defaultProps.onHide).not.toHaveBeenCalled();
  });

  test('handles authentication error', async () => {
    localStorage.removeItem('authToken');
    
    render(<AddTaskForm {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/title/i), 'New Task');
    
    const submitButton = screen.getByText('Add Task');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/no auth token found/i)).toBeInTheDocument();
    });
  });

  test('resets form after successful submission', async () => {
    render(<AddTaskForm {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    await userEvent.type(titleInput, 'Test Task');
    await userEvent.type(descriptionInput, 'Test Description');
    
    const submitButton = screen.getByText('Add Task');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onTaskAdded).toHaveBeenCalled();
    });
    
    // Form should be reset
    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
    expect(screen.getByLabelText(/status/i)).toHaveValue('to-do');
  });

  test('displays error message on API failure', async () => {
    // Mock a failed response by using invalid token
    localStorage.setItem('authToken', 'invalid-token');
    
    render(<AddTaskForm {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/title/i), 'Test Task');
    
    const submitButton = screen.getByText('Add Task');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/missing or invalid token/i)).toBeInTheDocument();
    });
  });

  test('form submission stops loading state on error', async () => {
    localStorage.setItem('authToken', 'invalid-token');
    
    render(<AddTaskForm {...defaultProps} />);
    
    await userEvent.type(screen.getByLabelText(/title/i), 'Test Task');
    
    const submitButton = screen.getByText('Add Task');
    await userEvent.click(submitButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/missing or invalid token/i)).toBeInTheDocument();
    });
    
    // Loading state should be finished
    expect(screen.queryByText('Adding...')).not.toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });
});
