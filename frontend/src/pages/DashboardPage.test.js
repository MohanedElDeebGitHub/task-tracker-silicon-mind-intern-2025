import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardPage } from './DashboardPage';
import { MemoryRouter } from 'react-router-dom';

// Mock react-router-dom navigate function
const mockNavigate = jest.fn();

// Use a more targeted mock that doesn't interfere with the module resolution
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

// Mock child components to isolate DashboardPage logic
jest.mock('../components/dashboard/SideBar', () => () => <div data-testid="sidebar"></div>);
jest.mock('../components/dashboard/TaskList', () => ({ tasks, onEditClick }) => (
  <div data-testid="task-list">
    {tasks.map(task => (
      <div
        key={task.id}
        onClick={() => onEditClick(task)}
        data-testid={`task-${task.id}`}
      >
        {task.title}
      </div>
    ))}
  </div>
));
jest.mock('../components/dashboard/UpdateTaskModal', () => ({ show, onHide, task, onTaskUpdated }) => {
  if (!show) return null;
  return (
    <div data-testid="update-modal">
      <p>Editing: {task.title}</p>
      <button onClick={onHide} data-testid="close-modal-btn">Close</button>
      <button
        onClick={() => onTaskUpdated({ ...task, title: 'Updated Title' })}
        data-testid="update-task-btn"
      >
        Update
      </button>
    </div>
  );
});
jest.mock('../components/dashboard/AddTaskForm', () => () => null);

// Mock CSS imports
jest.mock('../styles/dashboard.css', () => ({}));

// Mock fetch globally
global.fetch = jest.fn();

// Helper to render dashboard with optional tasks
const renderDashboard = (mockTasks = []) => {
  localStorage.setItem('authToken', 'mock-token');
  fetch.mockResolvedValue({
    ok: true,
    json: async () => mockTasks,
  });
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('Authentication and Initial Load', () => {
    it('redirects to login when no auth token is present', () => {
      localStorage.removeItem('authToken');
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('displays loading state initially, then shows tasks', async () => {
      renderDashboard([{ id: 1, title: 'Test Task' }]);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      fetch.mockRejectedValue(new Error('API is down'));
      localStorage.setItem('authToken', 'mock-token');
      render(
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      );
      await waitFor(() => {
        expect(screen.getByText('Error: API is down')).toBeInTheDocument();
      });
    });

    it('handles unauthorized (401) response by redirecting', async () => {
      localStorage.setItem('authToken', 'invalid-token');
      fetch.mockResolvedValue({ ok: false, status: 401 });
      render(
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Task Management Modals', () => {
    it('opens and closes the update modal correctly', async () => {
      renderDashboard([{ id: 1, title: 'Task One' }]);
      await waitFor(() => expect(screen.getByText('Task One')).toBeInTheDocument());

      expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('task-1'));
      await waitFor(() => {
        expect(screen.getByTestId('update-modal')).toBeInTheDocument();
        expect(screen.getByText('Editing: Task One')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('close-modal-btn'));
      await waitFor(() => {
        expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
      });
    });

    it('updates a task in the list after editing', async () => {
      renderDashboard([{ id: 1, title: 'Original Title' }]);
      await waitFor(() => expect(screen.getByText('Original Title')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('task-1'));
      await waitFor(() => expect(screen.getByTestId('update-modal')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('update-task-btn'));

      await waitFor(() => {
        expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
        expect(screen.getByText('Updated Title')).toBeInTheDocument();
        expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
      });
    });

    it('shows correct task when different tasks are edited sequentially', async () => {
      renderDashboard([
        { id: 1, title: 'First Task' },
        { id: 2, title: 'Second Task' },
      ]);
      await waitFor(() => expect(screen.getByText('First Task')).toBeInTheDocument());

      fireEvent.click(screen.getByTestId('task-1'));
      await waitFor(() => {
        expect(screen.getByText('Editing: First Task')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('close-modal-btn'));
      await waitFor(() => {
        expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-2'));
      await waitFor(() => {
        expect(screen.getByText('Editing: Second Task')).toBeInTheDocument();
      });
    });
  });
});
