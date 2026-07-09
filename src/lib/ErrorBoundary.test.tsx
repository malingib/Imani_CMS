// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Bomb(): React.ReactNode {
  throw new Error("💣");
}

function GoodChild() {
  return <div data-testid="child">All good</div>;
}

describe("ErrorBoundary", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("shows custom fallback on error", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Oops</div>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("fallback")).toBeTruthy();
  });

  it("calls onError when child throws", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ componentStack: expect.any(String) }));
  });

  it("shows default error UI with message", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("💣")).toBeTruthy();
    expect(screen.getByText("Try Again")).toBeTruthy();
  });

  it("reloads page on button click", () => {
    const reload = vi.fn();
    Object.defineProperty(window, "location", { value: { reload }, configurable: true });

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    vi.spyOn(window, "location", "get").mockReturnValue({ reload } as any);
    act(() => screen.getByText("Try Again").click());
    expect(reload).toHaveBeenCalledOnce();
  });
});
