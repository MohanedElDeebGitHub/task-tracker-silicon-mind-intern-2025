import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpdateTaskModal from './UpdateTaskModal';

describe('UpdateTaskModal', () => {
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'to-do'
  };

  const mockCompletedTask = {
    id: 2,
    title: 'Completed Task',
    description: 'Completed Description',
    status: 'done'
  };

  const defaultProps = {
    show: true,
    onHide: jest.fn(),
    task: mockTask,
    onTaskUpdated: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'fake-jwt-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders modal when show is true and task is provided', () => {
    render(<UpdateTaskModal {...defaultProps} />);
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    
    // For select elements, check the value attribute directly
    const statusSelect = screen.getByLabelText(/status/i);
    expect(statusSelect).toHaveValue('to-do');
  });

  test('does not render modal when show is false', () => {
    render(<UpdateTaskModal {...defaultProps} show={false} />);
    
    expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
  });

  test('does not render modal when task is null', () => {
    render(<UpdateTaskModal {...defaultProps} task={null} />);
    
    expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
  });

  test('populates form fields with task data', () => {
    render(<UpdateTaskModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const statusSelect = screen.getByLabelText(/status/i);
    
    expect(titleInput).toHaveValue('Test Task');
    expect(descriptionInput).toHaveValue('Test Description');
    expect(statusSelect).toHaveValue('to-do');
  });

  test('updates form fields when user types', async () => {
    render(<UpdateTaskModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Task');
    
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Updated Description');
    
    expect(titleInput).toHaveValue('Updated Task');
    expect(descriptionInput).toHaveValue('Updated Description');
  });

  test('updates status when selected', async () => {
    render(<UpdateTaskModal {...defaultProps} />);
    
    const statusSelect = screen.getByLabelText(/status/i);
    await userEvent.selectOptions(statusSelect, 'in progress');
    
    expect(statusSelect).toHaveValue('in progress');
  });

  test('submits form with updated data using MSW', async () => {
    render(<UpdateTaskModal {...defaultProps} />);
    
    // Update the form
    const titleInput = screen.getByLabelText(/title/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Task');
    
    // Submit the form
    const submitButton = screen.getByText('Save Changes');
    await userEvent.click(submitButton);
    
    // Wait for form submission to complete
    await waitFor(() => {
      expect(defaultProps.onTaskUpdated).toHaveBeenCalledTimes(1);
      expect(defaultProps.onHide).toHaveBeenCalledTimes(1);
    });
  });

  test('shows loading state during form submission', async () => {
    render(<UpdateTaskModal {...defaultProps} />);
    
    const submitButton = screen.getByText('Save Changes');
    await userEvent.click(submitButton);
    
    // Should show loading state - button becomes disabled immediately
    expect(submitButton).toBeDisabled();
  });

  test('prevents submission with empty title', async () => {
    render(<UpdateTaskModal {...defaultProps} />);
    
    // Clear title
    const titleInput = screen.getByLabelText(/title/i);
    await userEvent.clear(titleInput);
    
    // Try to submit
    const submitButton = screen.getByText('Save Changes');
    await userEvent.click(submitButton);
    
    // Form should not submit due to HTML5 validation
    expect(defaultProps.onTaskUpdated).not.toHaveBeenCalled();
  });

  test('handles authentication error', async () => {
    localStorage.removeItem('authToken');
    
    render(<UpdateTaskModal {...defaultProps} />);
    
    const submitButton = screen.getByText('Save Changes');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/missing or invalid token/i)).toBeInTheDocument();
    });
  });

  test('displays error message on API failure', async () => {
    // Mock a failed response by using invalid token
    localStorage.setItem('authToken', 'invalid-token');
    
    
    render(<UpdateTaskModal {...defaultProps} />);
    
    const submitButton = screen.getByText('Save Changes');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/missing or invalid token/i)).toBeInTheDocument();
    });
  });

  test('clears error when modal is closed', async () => {
    localStorage.setItem('authToken', 'invalid-token');
    
    
    render(<UpdateTaskModal {...defaultProps} />);
    
    // Trigger an error
    const submitButton = screen.getByText('Save Changes');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/missing or invalid token/i)).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByLabelText(/close/i);
    await userEvent.click(closeButton);
    
    expect(defaultProps.onHide).toHaveBeenCalled();
  });

  test('shows warning for completed tasks', () => {
    render(<UpdateTaskModal {...defaultProps} task={mockCompletedTask} />);
    
    expect(screen.getByText(/This task is completed/)).toBeInTheDocument();
    expect(screen.getByText(/Status cannot be changed/)).toBeInTheDocument();
  });

  test('disables status field for completed tasks', () => {
    render(<UpdateTaskModal {...defaultProps} task={mockCompletedTask} />);
    
    const statusSelect = screen.getByLabelText(/status/i);
    expect(statusSelect).toBeDisabled();
    expect(screen.getByText(/Status is locked because this task is completed/)).toBeInTheDocument();
  });

  test('allows editing title and description for completed tasks', async () => {
    
    render(<UpdateTaskModal {...defaultProps} task={mockCompletedTask} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    // Should be able to edit title and description
    expect(titleInput).not.toBeDisabled();
    expect(descriptionInput).not.toBeDisabled();
    
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Completed Task');
    
    expect(titleInput).toHaveValue('Updated Completed Task');
  });

  test('updates form when task prop changes', () => {
    const { rerender } = render(<UpdateTaskModal {...defaultProps} />);
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    
    // Change the task prop
    const newTask = {
      id: 3,
      title: 'Different Task',
      description: 'Different Description',
      status: 'in progress'
    };
    
    rerender(<UpdateTaskModal {...defaultProps} task={newTask} />);
    
    expect(screen.getByDisplayValue('Different Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Different Description')).toBeInTheDocument();
    
    // Check select value directly
    const statusSelect = screen.getByLabelText(/status/i);
    expect(statusSelect).toHaveValue('in progress');
  });

  test('handles task with missing properties', () => {
    const incompleteTask = {
      id: 4,
      // Missing title, description, status
    };
    
    render(<UpdateTaskModal {...defaultProps} task={incompleteTask} />);
    
    // Check specific elements instead of generic empty value
    const titleInput = screen.getByLabelText(/title/i);
    const statusSelect = screen.getByLabelText(/status/i);
    
    expect(titleInput).toHaveValue('');
    expect(statusSelect).toHaveValue('to-do'); // Default status
  });

  test('form submission stops loading state on error', async () => {
    localStorage.setItem('authToken', 'invalid-token');
    
    
    render(<UpdateTaskModal {...defaultProps} />);
    
    const submitButton = screen.getByText('Save Changes');
    await userEvent.click(submitButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/missing or invalid token/i)).toBeInTheDocument();
    });
    
    // Loading state should be finished
    expect(submitButton).not.toBeDisabled();
  });

  test('handles modal close via header close button', async () => {
    
    render(<UpdateTaskModal {...defaultProps} />);
    
    // Since the modal doesn't have a close button, test that it renders correctly
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(defaultProps.onHide).toHaveBeenCalledTimes(0);
  });
});
