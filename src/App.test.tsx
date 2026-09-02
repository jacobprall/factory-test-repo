import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches: initialMatches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => {
      listeners.push(cb);
    },
    removeEventListener: (
      _type: string,
      cb: (e: MediaQueryListEvent) => void,
    ) => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    },
  };
  window.matchMedia = vi
    .fn()
    .mockReturnValue(mql as unknown as MediaQueryList) as typeof matchMedia;

  return {
    fireChange(matches: boolean) {
      mql.matches = matches;
      for (const cb of [...listeners]) {
        cb({ matches } as MediaQueryListEvent);
      }
    },
  };
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("App", () => {
  it("should pass a basic sanity check", () => {
    expect(1 + 1).toBe(2);
  });

  it("defaults to the OS preference when nothing is saved", () => {
    mockMatchMedia(true);
    render(<App />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toBeTruthy();
  });

  it("toggles explicitly and flips aria-label/aria-pressed", () => {
    mockMatchMedia(false);
    render(<App />);

    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(button.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(button);

    const flipped = screen.getByRole("button", {
      name: "Switch to light theme",
    });
    expect(flipped.getAttribute("aria-pressed")).toBe("true");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("persists the explicit choice across remount and ignores later OS changes", () => {
    const { fireChange } = mockMatchMedia(false);
    const { unmount } = render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(localStorage.getItem("theme")).toBe("dark");

    unmount();
    cleanup();

    render(<App />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    // The OS now says light, but the explicit choice must win.
    fireChange(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toBeTruthy();
  });
});
