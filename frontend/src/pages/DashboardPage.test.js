import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { rest } from 'msw';
import { server } from '../mocks/server';
import { DashboardPage } from './DashboardPage';

// Mock CSS imports
jest.mock('../styles/dashboard.css', () => ({}));

// Mock child components
jest.mock('../components/dashboard/SideBar', () => () => 
  <div data-testid="sidebar">Sidebar</div>
);

jest.mock('../components/dashboard/StatsBar', () => ({ stats }) => 
  <div data-testid="stats-bar">
    {stats.map((stat, index) => (
      <div key={index} data-testid={`stat-${index}`}>
        {stat.title}: {stat.value}
      </div>
    ))}
  </div>
);

jest.mock('../components/dashboard/TaskList', () => ({ tasks, onEditClick }) => 
  <div data-testid="task-list">
    {tasks.map(task => (
      <div key={task.id} data-testid={`task-${task.id}`} onClick={() => onEditClick(task)}>
        {task.title} - {task.status}
      </div>
    ))}
  </div>
);

jest.mock('../components/dashboard/UpdateTaskModal', () => ({ show, task, onHide }) => {
  if (!show) return null;
  return (
    <div data-testid="update-task-modal">
      Modal for {task?.title}
      <button onClick={onHide} data-testid="close-modal">Close</button>
    </div>
  );
});

// Mock react-router hooks
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-jwt-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Set up MSW handler for tasks
    server.use(
      rest.get('http://localhost:3001/api/tasks', async (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
        }
        
        return res(
          ctx.status(200),
          ctx.json([
            { id: 1, title: 'Test Task 1', status: 'todo', description: 'Test description 1' },
            { id: 2, title: 'Test Task 2', status: 'in-progress', description: 'Test description 2' }
          ])
        );
      })
    );
  });

  const renderDashboardPage = () => {
    return render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
  };

  test('renders dashboard page components', async () => {
    renderDashboardPage();
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('stats-bar')).toBeInTheDocument();
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
    });
  });

  test('displays tasks from MSW API', async () => {
    renderDashboardPage();
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-2')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Test Task 1 - todo/)).toBeInTheDocument();
    expect(screen.getByText(/Test Task 2 - in-progress/)).toBeInTheDocument();
  });

  test('handles task edit modal', async () => {
    const user = userEvent.setup();
    renderDashboardPage();
    
    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByTestId('task-1')).toBeInTheDocument();
    });
    
    // Click on a task to edit
    await user.click(screen.getByTestId('task-1'));
    
    // Modal should appear
    await waitFor(() => {
      expect(screen.getByTestId('update-task-modal')).toBeInTheDocument();
    });
    
    // Close modal
    await user.click(screen.getByTestId('close-modal'));
    
    // Modal should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('update-task-modal')).not.toBeInTheDocument();
    });
  });

  test('handles authentication error', async () => {
    // Override MSW handler for unauthorized response
    server.use(
      rest.get('http://localhost:3001/api/tasks', async (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
      })
    );

    renderDashboardPage();
    
    // Should navigate to login on auth error
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
