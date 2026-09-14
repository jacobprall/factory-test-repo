import { useEffect, useMemo, useState } from "react";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todos";

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.text === "string" &&
    typeof candidate.done === "boolean"
  );
}

function loadTodos(): Todo[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (!parsed.every(isTodo)) return [];
    return parsed;
  } catch {
    return [];
  }
}

const EMPTY_STATE_MESSAGES: Record<Filter, string> = {
  all: "Nothing to do yet",
  active: "No active todos",
  completed: "No completed todos",
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // Ignore write failures (e.g. storage full or unavailable).
    }
  }, [todos]);

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
    setInput("");
  };

  const toggle = (id: number) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  const remove = (id: number) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearCompleted = () =>
    setTodos((prev) => prev.filter((t) => !t.done));

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.done);
      case "completed":
        return todos.filter((t) => t.done);
      default:
        return todos;
    }
  }, [todos, filter]);

  const activeCount = todos.filter((t) => !t.done).length;
  const hasCompleted = todos.some((t) => t.done);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="app">
      <h1>Todos</h1>
      <div className="add-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="What needs doing?"
          aria-label="New todo"
        />
        <button onClick={add}>Add</button>
      </div>

      <div className="toolbar">
        <div role="group" aria-label="Filter todos" className="filters">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`filter-btn${filter === key ? " active" : ""}`}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="clear-completed"
          onClick={clearCompleted}
          disabled={!hasCompleted}
          aria-disabled={!hasCompleted}
        >
          Clear completed
        </button>
      </div>

      {visibleTodos.length === 0 ? (
        <p className="empty-state">{EMPTY_STATE_MESSAGES[filter]}</p>
      ) : (
        <ul>
          {visibleTodos.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                aria-label={`Mark ${t.text} as complete`}
              />
              <span>{t.text}</span>
              <button
                onClick={() => remove(t.id)}
                aria-label={`Delete ${t.text}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="count">{activeCount} remaining</p>
    </div>
  );
}
