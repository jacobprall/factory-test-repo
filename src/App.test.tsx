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

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
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

  it("defaults to light when the OS prefers light", () => {
    mockMatchMedia(false);
    render(<App />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(
      screen.getByRole("button", { name: "Switch to dark theme" }),
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

  it("persists an explicit light choice made against a dark OS preference", () => {
    const { fireChange } = mockMatchMedia(true);
    const { unmount } = render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    unmount();
    cleanup();

    render(<App />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    // The OS flips back to dark, but the explicit light choice must win.
    fireChange(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    const button = screen.getByRole("button", {
      name: "Switch to dark theme",
    });
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("ignores a corrupt saved value and falls back to the OS preference", () => {
    localStorage.setItem("theme", "banana");
    const { fireChange } = mockMatchMedia(true);
    render(<App />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    // No valid saved choice means the OS is still followed.
    fireChange(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("still renders and toggles when localStorage reads throw", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    mockMatchMedia(false);
    render(<App />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("still toggles when localStorage writes throw", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    mockMatchMedia(false);
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toBeTruthy();
  });

  it("falls back to light when matchMedia is unavailable", () => {
    // @ts-expect-error deliberately simulating an environment without matchMedia
    window.matchMedia = undefined;
    render(<App />);

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
