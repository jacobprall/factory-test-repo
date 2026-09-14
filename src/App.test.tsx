import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const STORAGE_KEY = "todos";

async function addTodo(text: string) {
  const user = userEvent.setup();
  const input = screen.getByLabelText("New todo");
  await user.type(input, text);
  await user.keyboard("{Enter}");
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("adds a todo via Enter and shows it in the list", async () => {
    render(<App />);
    await addTodo("Buy milk");

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("1 remaining")).toBeInTheDocument();
  });

  it("persists todos to localStorage and restores them on remount", async () => {
    const { unmount } = render(<App />);
    await addTodo("Persisted todo");

    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].text).toBe("Persisted todo");

    unmount();

    render(<App />);
    expect(screen.getByText("Persisted todo")).toBeInTheDocument();
  });

  it("falls back to an empty list when localStorage has invalid JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not valid json");

    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByText("Nothing to do yet")).toBeInTheDocument();
    expect(screen.getByText("0 remaining")).toBeInTheDocument();
  });

  it("falls back to an empty list when localStorage has malformed todo objects", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "not-a-number", text: 5 }]),
    );

    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByText("Nothing to do yet")).toBeInTheDocument();
  });

  it("toggles a todo via the checkbox", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo("Toggle me");

    const checkbox = screen.getByLabelText("Mark Toggle me as complete");
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText("0 remaining")).toBeInTheDocument();
  });

  it("deletes a todo", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo("Delete me");

    await user.click(screen.getByLabelText("Delete Delete me"));

    expect(screen.queryByText("Delete me")).not.toBeInTheDocument();
    expect(screen.getByText("Nothing to do yet")).toBeInTheDocument();
  });

  it("filters todos by active and completed", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo("Active todo");
    await addTodo("Completed todo");

    await user.click(screen.getByLabelText("Mark Completed todo as complete"));

    await user.click(screen.getByRole("button", { name: "Active" }));
    expect(screen.getByText("Active todo")).toBeInTheDocument();
    expect(screen.queryByText("Completed todo")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.getByText("Completed todo")).toBeInTheDocument();
    expect(screen.queryByText("Active todo")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Active todo")).toBeInTheDocument();
    expect(screen.getByText("Completed todo")).toBeInTheDocument();
  });

  it("shows the active count regardless of selected filter", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo("Active todo");
    await addTodo("Completed todo");
    await user.click(screen.getByLabelText("Mark Completed todo as complete"));

    expect(screen.getByText("1 remaining")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.getByText("1 remaining")).toBeInTheDocument();
  });

  it("marks the selected filter with aria-pressed", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Active" }));
    expect(screen.getByRole("button", { name: "Active" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows contextual empty state messages per filter", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo("Only active todo");

    await user.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.getByText("No completed todos")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Active" }));
    expect(screen.getByText("Only active todo")).toBeInTheDocument();

    await user.click(
      screen.getByLabelText("Mark Only active todo as complete"),
    );
    expect(screen.getByText("No active todos")).toBeInTheDocument();
  });

  it("disables Clear completed when there are no completed todos", async () => {
    render(<App />);
    await addTodo("Not done yet");

    expect(screen.getByRole("button", { name: "Clear completed" })).toBeDisabled();
  });

  it("clears only completed todos without removing active ones", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTodo("Active todo");
    await addTodo("Completed todo");
    await user.click(screen.getByLabelText("Mark Completed todo as complete"));

    const clearButton = screen.getByRole("button", { name: "Clear completed" });
    expect(clearButton).toBeEnabled();
    await user.click(clearButton);

    expect(screen.getByText("Active todo")).toBeInTheDocument();
    expect(screen.queryByText("Completed todo")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear completed" })).toBeDisabled();
  });

  it("renders filter controls within an accessible group", () => {
    render(<App />);
    const group = screen.getByRole("group", { name: "Filter todos" });
    expect(within(group).getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(
      within(group).getByRole("button", { name: "Active" }),
    ).toBeInTheDocument();
    expect(
      within(group).getByRole("button", { name: "Completed" }),
    ).toBeInTheDocument();
  });
});
