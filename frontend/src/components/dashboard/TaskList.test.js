import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskList from './TaskList';

// Mock CSS imports
jest.mock('../../styles/TaskList.css', () => ({}));

// Mock AddTaskForm component
jest.mock('./AddTaskForm', () => {
  return function MockAddTaskForm({ show, onHide, onTaskAdded }) {
    return show ? (
      <div data-testid="add-task-form">
        <h2>Add New Task</h2>
        <button onClick={onHide}>Close</button>
        <button onClick={() => onTaskAdded()}>Add Task</button>
      </div>
    ) : null;
  };
});

describe('TaskList', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Task 1',
      description: 'First task description',
      status: 'to-do',
      created_at: '2024-01-15T10:00:00Z',
      total_duration: null
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Second task description',
      status: 'in progress',
      created_at: '2024-01-16T11:00:00Z',
      total_duration: { hours: 2, minutes: 30, seconds: 15 }
    },
    {
      id: 3,
      title: 'Task 3',
      description: 'Third task description',
      status: 'done',
      created_at: '2024-01-17T12:00:00Z',
      total_duration: { hours: 1, minutes: 45, seconds: 0 }
    },
    {
      id: 4,
      title: 'Task 4',
      description: 'Fourth task description',
      status: 'to-do',
      created_at: '2024-01-18T13:00:00Z',
      total_duration: null
    },
    {
      id: 5,
      title: 'Task 5',
      description: 'Fifth task description',
      status: 'done',
      created_at: '2024-01-19T14:00:00Z',
      total_duration: {}
    }
  ];

  const defaultProps = {
    tasks: mockTasks,
    onEditClick: jest.fn(),
    onTaskAdded: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task list with correct header', () => {
    render(<TaskList {...defaultProps} />);
    
    expect(screen.getByText(/All Tasks \(5\)/)).toBeInTheDocument();
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('all')).toBeInTheDocument();
  });

  test('displays table headers correctly', () => {
    render(<TaskList {...defaultProps} />);
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('renders all tasks with pagination (3 tasks per page)', () => {
    render(<TaskList {...defaultProps} />);
    
    // Should show first 3 tasks
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    
    // Should not show tasks 4 and 5 on first page
    expect(screen.queryByText('Task 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 5')).not.toBeInTheDocument();
    
    // Should show pagination
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  test('handles empty tasks array', () => {
    render(<TaskList {...defaultProps} tasks={[]} />);
    
    expect(screen.getByText(/All Tasks \(0\)/)).toBeInTheDocument();
    expect(screen.getByText('No tasks found.')).toBeInTheDocument();
  });

  test('handles null/undefined tasks prop', () => {
    render(<TaskList {...defaultProps} tasks={null} />);
    
    expect(screen.getByText(/All Tasks \(0\)/)).toBeInTheDocument();
    expect(screen.getByText('No tasks found.')).toBeInTheDocument();
  });

  test('filters tasks by status', async () => {
    const user = userEvent.setup();
    render(<TaskList {...defaultProps} />);
    
    const filterSelect = screen.getByDisplayValue('all');
    
    // Filter by 'done' status
    await user.selectOptions(filterSelect, 'done');
    
    expect(screen.getByText(/All Tasks \(2\)/)).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    expect(screen.getByText('Task 5')).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  });

  test('resets to page 1 when filter changes', async () => {
    const user = userEvent.setup();
    render(<TaskList {...defaultProps} />);
    
    // Go to page 2
    const nextButton = screen.getByText('2');
    await user.click(nextButton);
    
    expect(screen.getByText('Task 4')).toBeInTheDocument();
    
    // Change filter
    const filterSelect = screen.getByDisplayValue('all');
    await user.selectOptions(filterSelect, 'to-do');
    
    // Should reset to page 1 and show filtered results
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 4')).toBeInTheDocument();
  });

  test('handles pagination navigation', async () => {
    const user = userEvent.setup();
    render(<TaskList {...defaultProps} />);
    
    // Navigate to page 2
    const page2Button = screen.getByText('2');
    await user.click(page2Button);
    
    expect(screen.getByText('Task 4')).toBeInTheDocument();
    expect(screen.getByText('Task 5')).toBeInTheDocument();
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    
    // Navigate back to page 1
    const page1Button = screen.getByText('1');
    await user.click(page1Button);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 4')).not.toBeInTheDocument();
  });

  test('displays correct status badges', () => {
    render(<TaskList {...defaultProps} />);
    
    // Check different status badges
    expect(screen.getByText('to-do')).toBeInTheDocument();
    expect(screen.getByText('in progress')).toBeInTheDocument();
    expect(screen.getByText('done')).toBeInTheDocument();
  });

  test('formats duration correctly', () => {
    render(<TaskList {...defaultProps} />);
    
    // Task with duration
    expect(screen.getByText('2h 30m 15s')).toBeInTheDocument();
    
    // Task without duration but in progress
    expect(screen.getByText('Task unfinished')).toBeInTheDocument();
    
    // Go to page 2 to see task with empty duration object
    const page2Button = screen.getByText('2');
    fireEvent.click(page2Button);
    
    // Task with empty duration object but done status
    expect(screen.getByText('Immediate finish')).toBeInTheDocument();
  });

  test('formats dates correctly', () => {
    render(<TaskList {...defaultProps} />);
    
    // Check that dates are formatted as locale strings
    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  test('calls onEditClick when task row is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskList {...defaultProps} />);
    
    const taskRow = screen.getByText('Task 1').closest('tr');
    await user.click(taskRow);
    
    expect(defaultProps.onEditClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  test('opens add task modal when New Task button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskList {...defaultProps} />);
    
    const newTaskButton = screen.getByText('New Task');
    await user.click(newTaskButton);
    
    expect(screen.getByTestId('add-task-form')).toBeInTheDocument();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  test('closes add task modal', async () => {
    const user = userEvent.setup();
    render(<TaskList {...defaultProps} />);
    
    // Open modal
    const newTaskButton = screen.getByText('New Task');
    await user.click(newTaskButton);
    
    // Close modal
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);
    
    expect(screen.queryByTestId('add-task-form')).not.toBeInTheDocument();
  });

  test('handles task added callback', async () => {
    const user = userEvent.setup();
    render(<TaskList {...defaultProps} />);
    
    // Open modal
    const newTaskButton = screen.getByText('New Task');
    await user.click(newTaskButton);
    
    // Add task
    const addTaskButton = screen.getByText('Add Task');
    await user.click(addTaskButton);
    
    expect(defaultProps.onTaskAdded).toHaveBeenCalled();
  });

  test('displays pagination info correctly', () => {
    render(<TaskList {...defaultProps} />);
    
    expect(screen.getByText('Showing 1-3 of 5 tasks')).toBeInTheDocument();
    
    // Navigate to page 2
    const page2Button = screen.getByText('2');
    fireEvent.click(page2Button);
    
    expect(screen.getByText('Showing 4-5 of 5 tasks')).toBeInTheDocument();
  });

  test('handles tasks with missing properties gracefully', () => {
    const incompleteTask = {
      id: 999,
      // Missing title, description, status, etc.
    };
    
    render(<TaskList {...defaultProps} tasks={[incompleteTask]} />);
    
    expect(screen.getByText('Untitled Task')).toBeInTheDocument();
    expect(screen.getByText('No description')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });

  test('applies correct CSS classes for task status', () => {
    render(<TaskList {...defaultProps} />);
    
    const todoTask = screen.getByText('Task 1').closest('tr');
    const inProgressTask = screen.getByText('Task 2').closest('tr');
    const doneTask = screen.getByText('Task 3').closest('tr');
    
    expect(todoTask).toHaveClass('task-row', 'status-to-do');
    expect(inProgressTask).toHaveClass('task-row', 'status-in-progress');
    expect(doneTask).toHaveClass('task-row', 'status-done');
  });

  test('handles single page of results (no pagination)', () => {
    const fewTasks = mockTasks.slice(0, 2);
    render(<TaskList {...defaultProps} tasks={fewTasks} />);
    
    expect(screen.queryByText('Page 1 of')).not.toBeInTheDocument();
    expect(screen.queryByText('Showing')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
