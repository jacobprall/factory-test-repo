import type { Todo } from "./types";

export type Filter = "all" | "active" | "completed";

export const FILTERS: Filter[] = ["all", "active", "completed"];

export const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  active: "Active",
  completed: "Completed",
};

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  switch (filter) {
    case "active":
      return todos.filter((t) => !t.done);
    case "completed":
      return todos.filter((t) => t.done);
    default:
      return todos;
  }
}

export function countActive(todos: Todo[]): number {
  return todos.filter((t) => !t.done).length;
}
