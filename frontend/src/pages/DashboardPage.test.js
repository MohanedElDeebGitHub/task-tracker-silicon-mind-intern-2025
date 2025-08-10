import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { server } from '../mocks/server';
import { rest } from 'msw';
import DashboardPage from './DashboardPage';

// Mock all the dashboard components to isolate the DashboardPage logic
jest.mock('../components/dashboard/SideBar', () => {
  return function MockSideBar({ selectedFilter, onFilterChange, onLogout }) {
    return (
      <div data-testid="sidebar">
        <button onClick={() => onFilterChange('all')}>All Tasks</button>
        <button onClick={() => onFilterChange('pending')}>Pending</button>
        <button onClick={() => onFilterChange('in-progress')}>In Progress</button>
        <button onClick={() => onFilterChange('completed')}>Completed</button>
        <button onClick={onLogout}>Logout</button>
      </div>
    );
  };
});

jest.mock('../components/dashboard/StatsBar', () => {
  return function MockStatsBar() {
    return <div data-testid="statsbar">Stats</div>;
  };
});

jest.mock('../components/dashboard/TaskList', () => {
  return function MockTaskList({ tasks, onTaskUpdate, onTaskDelete }) {
    return (
      <div data-testid="tasklist">
        {tasks?.map(task => (
                    <div key={task.id} data-testid={`task-${task.id}`}>
            <span>{task.title}</span>
            <button onClick={() => onTaskUpdate(task)}>Edit</button>
            <button onClick={() => onTaskDelete(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../components/dashboard/UpdateTaskModal', () => {
  return function MockUpdateTaskModal({ isOpen, task, onClose, onSave }) {
    return isOpen ? (
      <div data-testid="update-modal">
        <input 
          defaultValue={task?.title} 
          data-testid="modal-title-input"
        />
        <button onClick={() => onSave({ ...task, title: 'Updated Task' })}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null;
  };
});

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();

// This needs to be before the import of DashboardPage
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardPage', () => {
  beforeEach(() => {
    // Clear localStorage and set up auth
    localStorage.clear();
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
    
    // Clear all mocks
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders dashboard components correctly', async () => {
    // Mock successful tasks fetch
    server.use(
      rest.get('http://localhost:5000/api/tasks', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: [
              { id: 1, title: 'Test Task 1', status: 'pending' },
              { id: 2, title: 'Test Task 2', status: 'completed' }
            ]
          })
        );
      })
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Check if main components are rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('statsbar')).toBeInTheDocument();
    expect(screen.getByTestId('tasklist')).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-2')).toBeInTheDocument();
    });
  });

  test('handles filter changes correctly', async () => {
    server.use(
      rest.get('http://localhost:5000/api/tasks', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: [
              { id: 1, title: 'Pending Task', status: 'pending' },
              { id: 2, title: 'Completed Task', status: 'completed' }
            ]
          })
        );
      })
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
    });

    // Click on filter buttons to test functionality
    fireEvent.click(screen.getByText('Pending'));
    fireEvent.click(screen.getByText('Completed'));
    fireEvent.click(screen.getByText('All Tasks'));
  });

  test('handles task update correctly', async () => {
    server.use(
      rest.get('http://localhost:5000/api/tasks', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: [{ id: 1, title: 'Test Task', status: 'pending' }]
          })
        );
      }),
      rest.put('http://localhost:5000/api/tasks/1', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: { id: 1, title: 'Updated Task', status: 'pending' }
          })
        );
      })
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Wait for task to load
    await waitFor(() => {
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
    });

    // Click edit button
    fireEvent.click(screen.getByText('Edit'));

    // Check if modal opens
    expect(screen.getByTestId('update-modal')).toBeInTheDocument();

    // Save the task
    fireEvent.click(screen.getByText('Save'));

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
    });
  });

  test('handles logout correctly', async () => {
    server.use(
      rest.get('http://localhost:5000/api/tasks', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ success: true, data: [] })
        );
      })
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Click logout button
    fireEvent.click(screen.getByText('Logout'));

    // Check if localStorage is cleared and navigation occurs
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
