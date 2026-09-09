import { useEffect, useState } from "react";
import {
  FILTERS,
  FILTER_LABELS,
  countActive,
  filterTodos,
  type Filter,
} from "./filters";
import { loadTodos, saveTodos } from "./storage";
import type { Todo } from "./types";

function emptyMessage(filter: Filter, hasTodos: boolean): string {
  if (!hasTodos) return "Nothing here yet — add your first todo above.";
  if (filter === "active") return "No active todos. You're all caught up!";
  if (filter === "completed") return "No completed todos yet.";
  return "Nothing here yet — add your first todo above.";
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    saveTodos(todos);
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

  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.done));

  const visible = filterTodos(todos, filter);
  const activeCount = countActive(todos);
  const hasCompleted = todos.some((t) => t.done);

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

      <div className="filters" role="group" aria-label="Filter todos">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className="filter-btn"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">{emptyMessage(filter, todos.length > 0)}</p>
      ) : (
        <ul>
          {visible.map((t) => (
            <li key={t.id} className={t.done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggle(t.id)}
                  aria-label={`Mark "${t.text}" as ${
                    t.done ? "active" : "completed"
                  }`}
                />
                <span>{t.text}</span>
              </label>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label={`Delete "${t.text}"`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <div className="footer-row">
          <p className="count" aria-live="polite">
            {activeCount} remaining
          </p>
          <button
            type="button"
            className="clear-completed"
            onClick={clearCompleted}
            disabled={!hasCompleted}
          >
            Clear completed
          </button>
        </div>
      )}
    </div>
  );
}
