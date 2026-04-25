import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../components/ErrorBoundary";

function ThrowingChild(): never {
  throw new Error("Boom from test component");
}

describe("ErrorBoundary", () => {
  it("renders a full-page fallback with the error message and reload button", () => {
    const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reloadMock = vi.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        reload: reloadMock
      }
    });

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Boom from test component")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reload" }));

    expect(reloadMock).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation
    });

    consoleErrorMock.mockRestore();
  });
});
