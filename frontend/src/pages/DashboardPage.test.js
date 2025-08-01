import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardPage } from './DashboardPage';

// Mock react-router-dom (the correct package name)
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'), // Keep other exports
  useNavigate: () => mockNavigate,
}));

// Mock child components to isolate the DashboardPage logic
jest.mock('../components/dashboard/SideBar', () => () => <div data-testid="sidebar"></div>);
jest.mock('../components/dashboard/TaskList', () => ({ tasks, onEditClick }) => (
  <div data-testid="task-list">
    {tasks.map(task => (
      <div key={task.id} onClick={() => onEditClick(task)} data-testid={`task-${task.id}`}>
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
      <button onClick={() => onTaskUpdated({ ...task, title: 'Updated Title' })} data-testid="update-task-btn">Update</button>
    </div>
  );
});
jest.mock('../components/dashboard/AddTaskForm', () => () => null); // Not testing this interaction here

// Mock CSS imports
jest.mock('../styles/dashboard.css', () => ({}));

// Mock fetch globally
global.fetch = jest.fn();

// Helper function to set up a clean render for each test
const renderDashboard = (mockTasks = []) => {
  localStorage.setItem('authToken', 'mock-token');
  fetch.mockResolvedValue({
    ok: true,
    json: async () => mockTasks,
  });
  return render(<DashboardPage />);
};


describe('DashboardPage', () => {

  beforeEach(() => {
    // Clear mocks and localStorage before each test
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
    // Mock console.error to keep test output clean
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore mocks
    console.error.mockRestore();
  });

  // --- Test Suite for Initial Load & Auth ---
  describe('Authentication and Initial Load', () => {
    it('redirects to login when no auth token is present', () => {
      localStorage.removeItem('authToken'); // Ensure no token
      render(<DashboardPage />);
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
      render(<DashboardPage />);
      await waitFor(() => {
        expect(screen.getByText('Error: API is down')).toBeInTheDocument();
      });
    });

    it('handles unauthorized (401) response by redirecting', async () => {
        localStorage.setItem('authToken', 'invalid-token');
        fetch.mockResolvedValue({ ok: false, status: 401 });
        render(<DashboardPage />);
        await waitFor(() => {
            expect(localStorage.getItem('authToken')).toBeNull();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
  });

  // --- Test Suite for User Interactions ---
  describe('Task Management Modals', () => {
    it('opens and closes the update modal correctly', async () => {
      renderDashboard([{ id: 1, title: 'Task One' }]);
      await waitFor(() => expect(screen.getByText('Task One')).toBeInTheDocument());

      // Modal should not be visible initially
      expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();

      // Click a task to open the modal
      fireEvent.click(screen.getByTestId('task-1'));
      await waitFor(() => {
        expect(screen.getByTestId('update-modal')).toBeInTheDocument();
        expect(screen.getByText('Editing: Task One')).toBeInTheDocument();
      });

      // Click the close button
      fireEvent.click(screen.getByTestId('close-modal-btn'));
      await waitFor(() => {
        expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
      });
    });

    it('updates a task in the list after editing', async () => {
      renderDashboard([{ id: 1, title: 'Original Title' }]);
      await waitFor(() => expect(screen.getByText('Original Title')).toBeInTheDocument());

      // Open the modal
      fireEvent.click(screen.getByTestId('task-1'));
      await waitFor(() => expect(screen.getByTestId('update-modal')).toBeInTheDocument());
      
      // Click the update button in the mock modal
      fireEvent.click(screen.getByTestId('update-task-btn'));

      // The modal should close and the task title should be updated
      await waitFor(() => {
        expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
        expect(screen.getByText('Updated Title')).toBeInTheDocument();
        expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
      });
    });

    // This is the test that was failing due to the double-render issue
    it('shows correct task when different tasks are edited sequentially', async () => {
        renderDashboard([
            { id: 1, title: 'First Task' },
            { id: 2, title: 'Second Task' }
        ]);
        await waitFor(() => expect(screen.getByText('First Task')).toBeInTheDocument());

        // --- Edit first task ---
        fireEvent.click(screen.getByTestId('task-1'));
        await waitFor(() => {
            expect(screen.getByText('Editing: First Task')).toBeInTheDocument();
        });

        // Close modal
        fireEvent.click(screen.getByTestId('close-modal-btn'));
        await waitFor(() => {
            expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
        });

        // --- Edit second task ---
        fireEvent.click(screen.getByTestId('task-2'));
        await waitFor(() => {
            expect(screen.getByText('Editing: Second Task')).toBeInTheDocument();
        });
    });
  });
});
