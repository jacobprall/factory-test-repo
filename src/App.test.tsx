import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { countActive, filterTodos } from "./filters";
import { STORAGE_KEY, loadTodos, saveTodos } from "./storage";
import type { Todo } from "./types";

const todos: Todo[] = [
  { id: 1, text: "write code", done: false },
  { id: 2, text: "review PR", done: true },
  { id: 3, text: "ship it", done: false },
];

describe("filterTodos", () => {
  it("returns every todo for the 'all' filter", () => {
    expect(filterTodos(todos, "all")).toEqual(todos);
  });

  it("returns only unfinished todos for the 'active' filter", () => {
    expect(filterTodos(todos, "active")).toEqual([todos[0], todos[2]]);
  });

  it("returns only finished todos for the 'completed' filter", () => {
    expect(filterTodos(todos, "completed")).toEqual([todos[1]]);
  });

  it("handles an empty list", () => {
    expect(filterTodos([], "active")).toEqual([]);
    expect(filterTodos([], "completed")).toEqual([]);
  });

  it("does not mutate the input list", () => {
    const input = [...todos];
    filterTodos(input, "completed");
    expect(input).toEqual(todos);
  });
});

describe("countActive", () => {
  it("counts unfinished todos", () => {
    expect(countActive(todos)).toBe(2);
  });

  it("returns 0 for an empty list", () => {
    expect(countActive([])).toBe(0);
  });

  it("returns 0 when every todo is done", () => {
    expect(countActive(todos.map((t) => ({ ...t, done: true })))).toBe(0);
  });

  it("counts every todo when none are done", () => {
    expect(countActive(todos.map((t) => ({ ...t, done: false })))).toBe(3);
  });
});

describe("storage", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an empty list when nothing is stored", () => {
    expect(loadTodos()).toEqual([]);
  });

  it("round-trips todos through save and load", () => {
    saveTodos(todos);
    expect(loadTodos()).toEqual(todos);
  });

  it("round-trips an empty list", () => {
    saveTodos([]);
    expect(loadTodos()).toEqual([]);
  });

  it("returns an empty list for malformed JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadTodos()).toEqual([]);
  });

  it("returns an empty list when the stored value is not an array", () => {
    localStorage.setItem(STORAGE_KEY, "42");
    expect(loadTodos()).toEqual([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 1 }));
    expect(loadTodos()).toEqual([]);
  });

  it("drops entries that are not shaped like a todo", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        todos[0],
        1,
        null,
        { id: "2", text: "bad id", done: false },
        { id: 3, text: "missing done" },
        todos[1],
      ]),
    );
    expect(loadTodos()).toEqual([todos[0], todos[1]]);
  });

  it("does not throw when storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    });
    expect(() => saveTodos(todos)).not.toThrow();
    expect(loadTodos()).toEqual([]);
  });
});
