import React from "react";
import { render, screen } from "@testing-library/react";
import BrandingPanel from "./BrandingPanel";

// Mock CSS imports
jest.mock("../../styles/auth.css", () => ({}));

describe("BrandingPanel", () => {
  test("renders TrackR branding correctly", () => {
    render(<BrandingPanel />);

    // Check if the main title is rendered
    expect(screen.getByText("TrackR")).toBeInTheDocument();

    // Check if the subtitle is rendered
    expect(screen.getByText("Lightweight Task Tracking")).toBeInTheDocument();
  });

  test("has correct CSS classes for styling", () => {
    const { container } = render(<BrandingPanel />);

    // Check if the main container has the expected classes
    const brandingPanel = container.querySelector(".branding-panel");
    expect(brandingPanel).toBeInTheDocument();
    expect(brandingPanel).toHaveClass(
      "text-white",
      "d-flex",
      "flex-column",
      "justify-content-center",
      "p-5",
    );
  });

  test("renders decorative circle elements", () => {
    const { container } = render(<BrandingPanel />);

    // Check if decorative circles are present
    const circle1 = container.querySelector(".circle-1");
    const circle2 = container.querySelector(".circle-2");

    expect(circle1).toBeInTheDocument();
    expect(circle2).toBeInTheDocument();
    expect(circle1).toHaveClass("circle");
    expect(circle2).toHaveClass("circle");
  });

  test("renders content with correct CSS classes", () => {
    const { container } = render(<BrandingPanel />);

    // Check if branding content elements have the correct class
    const brandingContent = container.querySelectorAll(
      ".branding-panel-content",
    );
    expect(brandingContent).toHaveLength(2); // h1 and p elements
  });
});
