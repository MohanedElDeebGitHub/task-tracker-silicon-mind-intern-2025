import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Mock Navigate component to avoid router context issues
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Navigate: ({ to }) => <div data-testid="navigate-to">{to}</div>,
}));

const MockComponent = () => (
  <div data-testid="protected-content">Protected Content</div>
);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders children when user is authenticated", () => {
    // Set up authentication token
    localStorage.setItem("authToken", "fake-jwt-token");

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  test("redirects to login when user is not authenticated", () => {
    // Ensure no token is present
    localStorage.removeItem("authToken");

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </MemoryRouter>,
    );

    // Should show navigation to login page
    expect(screen.getByTestId("navigate-to")).toHaveTextContent("/login");
    // The protected content should not be rendered
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  test("redirects when token is null", () => {
    localStorage.removeItem("authToken"); // Actually remove the token

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </MemoryRouter>,
    );

    // Should show navigation to login page since token is missing
    expect(screen.getByTestId("navigate-to")).toHaveTextContent("/login");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  test("redirects when token is empty string", () => {
    localStorage.setItem("authToken", "");

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute>
          <MockComponent />
        </ProtectedRoute>
      </MemoryRouter>,
    );

    // Should show navigation to login page since token is empty
    expect(screen.getByTestId("navigate-to")).toHaveTextContent("/login");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  test("works with valid token values", () => {
    const validTokens = ["jwt-token-123", "Bearer token", "session-12345"];

    validTokens.forEach((token, index) => {
      localStorage.setItem("authToken", token);

      const { unmount } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <MockComponent />
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();

      // Clean up for next iteration
      unmount();
      localStorage.clear();
    });
  });
});
