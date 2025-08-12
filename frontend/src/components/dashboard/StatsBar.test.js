import React from "react";
import { render, screen } from "@testing-library/react";
import StatsBar from "./StatsBar";

// Mock StatCard component
jest.mock("./StatCard", () => {
  return function MockStatCard({ title, value, trend }) {
    return (
      <div data-testid="stat-card">
        <div data-testid="stat-title">{title}</div>
        <div data-testid="stat-value">{value}</div>
        <div data-testid="stat-trend">{trend}</div>
      </div>
    );
  };
});

describe("StatsBar", () => {
  const mockStats = [
    {
      title: "Total Tasks",
      value: 15,
      trend: "+5%",
    },
    {
      title: "Completed",
      value: 8,
      trend: "+12%",
    },
    {
      title: "In Progress",
      value: 3,
      trend: "-2%",
    },
  ];

  test("renders all stat cards", () => {
    render(<StatsBar stats={mockStats} />);

    const statCards = screen.getAllByTestId("stat-card");
    expect(statCards).toHaveLength(3);
  });

  test("passes correct props to StatCard components", () => {
    render(<StatsBar stats={mockStats} />);

    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("+5%")).toBeInTheDocument();

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();

    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("-2%")).toBeInTheDocument();
  });

  test("handles empty stats array", () => {
    render(<StatsBar stats={[]} />);

    const statCards = screen.queryAllByTestId("stat-card");
    expect(statCards).toHaveLength(0);
  });

  test("handles single stat", () => {
    const singleStat = [
      {
        title: "Single Stat",
        value: 1,
        trend: "0%",
      },
    ];

    render(<StatsBar stats={singleStat} />);

    const statCards = screen.getAllByTestId("stat-card");
    expect(statCards).toHaveLength(1);

    expect(screen.getByText("Single Stat")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  test("renders with responsive grid layout", () => {
    const { container } = render(<StatsBar stats={mockStats} />);

    // Check for Bootstrap classes
    expect(container.querySelector(".row")).toBeInTheDocument();
    expect(container.querySelector(".mb-4")).toBeInTheDocument();

    const columns = container.querySelectorAll(".col-md-4");
    expect(columns).toHaveLength(3);
  });

  test("handles stats with undefined properties", () => {
    const incompleteStats = [
      {
        title: "Incomplete Stat",
        // Missing value and trend
      },
      {
        value: 5,
        // Missing title and trend
      },
    ];

    render(<StatsBar stats={incompleteStats} />);

    const statCards = screen.getAllByTestId("stat-card");
    expect(statCards).toHaveLength(2);

    expect(screen.getByText("Incomplete Stat")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
