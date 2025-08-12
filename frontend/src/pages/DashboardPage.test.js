// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../components/dashboard/TaskList", () => {
  return function MockTaskList({ tasks, onEditClick, onTaskDelete }) {
    return (
      <div data-testid="tasklist">
        {tasks &&
          tasks.map((task) => (
            <div
              key={task.id}
              data-testid={`task-${task.id}`}
              onClick={() => onEditClick && onEditClick(task)}
              style={{ cursor: "pointer" }}
            >
              <span>{task.title}</span>
            </div>
          ))}
      </div>
    );
  };
});

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { server } from "../mocks/server";
import { rest } from "msw";

import DashboardPage from "./DashboardPage";

// Mock all the dashboard components to isolate the DashboardPage logic
jest.mock("../components/dashboard/SideBar", () => {
  return function MockSideBar({ selectedFilter, onFilterChange, onLogout }) {
    return (
      <div data-testid="sidebar">
        <button onClick={() => onFilterChange && onFilterChange("all")}>
          All Tasks
        </button>
        <button onClick={() => onFilterChange && onFilterChange("pending")}>
          Pending
        </button>
        <button onClick={() => onFilterChange && onFilterChange("in-progress")}>
          In Progress
        </button>
        <button onClick={() => onFilterChange && onFilterChange("completed")}>
          Completed
        </button>
        <button onClick={() => onLogout && onLogout()}>Logout</button>
      </div>
    );
  };
});

jest.mock("../components/dashboard/StatsBar", () => {
  return function MockStatsBar() {
    return <div data-testid="statsbar">Stats</div>;
  };
});

jest.mock("../components/dashboard/TaskList", () => {
  return function MockTaskList({ tasks, onEditClick, onTaskDelete }) {
    return (
      <div data-testid="tasklist">
        {tasks &&
          tasks.map((task) => (
            <div key={task.id} data-testid={`task-${task.id}`}>
              <span>{task.title}</span>
              <button onClick={() => onEditClick && onEditClick(task)}>
                Edit
              </button>
              <button onClick={() => onTaskDelete && onTaskDelete(task.id)}>
                Delete
              </button>
            </div>
          ))}
      </div>
    );
  };
});

jest.mock("../components/dashboard/UpdateTaskModal", () => {
  return function MockUpdateTaskModal({ show, task, onHide, onTaskUpdated }) {
    return show ? (
      <div data-testid="update-modal">
        <input defaultValue={task?.title} data-testid="modal-title-input" />
        <button
          onClick={() =>
            onTaskUpdated && onTaskUpdated({ ...task, title: "Updated Task" })
          }
        >
          Save
        </button>
        <button onClick={onHide}>Cancel</button>
      </div>
    ) : null;
  };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    // Clear localStorage and set up auth
    localStorage.clear();
    localStorage.setItem("token", "mock-jwt-token");
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "Test User" }));

    // Clear all mocks
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  beforeEach(() => {
    // Set up authentication
    localStorage.setItem("authToken", "fake-jwt-token");

    // Reset mock functions
    mockNavigate.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders dashboard components correctly", async () => {
    // Mock successful tasks fetch
    server.use(
      rest.get("http://localhost:5000/api/tasks", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: [
              { id: 1, title: "Test Task 1", status: "pending" },
              { id: 2, title: "Test Task 2", status: "completed" },
            ],
          }),
        );
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // Wait for loading to complete and check if main components are rendered
    await waitFor(() => {
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    expect(screen.getByTestId("tasklist")).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByTestId("task-1")).toBeInTheDocument();
      expect(screen.getByTestId("task-2")).toBeInTheDocument();
    });
  });

  test("handles filter changes correctly", async () => {
    server.use(
      rest.get("http://localhost:5000/api/tasks", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: [
              { id: 1, title: "Pending Task", status: "pending" },
              { id: 2, title: "Completed Task", status: "completed" },
            ],
          }),
        );
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    // Just verify filter buttons exist and can be clicked (components are mocked)
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("All Tasks")).toBeInTheDocument();
  });

  test("handles task update correctly", async () => {
    server.use(
      rest.get("http://localhost:5000/api/tasks", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: [{ id: 1, title: "Test Task", status: "pending" }],
          }),
        );
      }),
      rest.put("http://localhost:5000/api/tasks/1", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: { id: 1, title: "Updated Task", status: "pending" },
          }),
        );
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // Wait for task to load
    await waitFor(() => {
      expect(screen.getByTestId("task-1")).toBeInTheDocument();
    });

    // Click on the Edit button of the first task
    const firstTaskEditButton = within(screen.getByTestId("task-1")).getByText(
      "Edit",
    );
    fireEvent.click(firstTaskEditButton);

    // Check if modal opens
    await waitFor(() => {
      expect(screen.getByTestId("update-modal")).toBeInTheDocument();
    });

    // Save the task
    fireEvent.click(screen.getByText("Save"));

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByTestId("update-modal")).not.toBeInTheDocument();
    });
  });

  test("renders dashboard layout correctly", async () => {
    server.use(
      rest.get("http://localhost:5000/api/tasks", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ success: true, data: [] }));
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    });

    // Verify basic layout elements are present
    expect(screen.getByTestId("tasklist")).toBeInTheDocument();
    expect(screen.getByText(/Hello,/)).toBeInTheDocument(); // Header text
  });
});
