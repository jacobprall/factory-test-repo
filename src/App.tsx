import { useState } from "react";
import { useTheme } from "./useTheme";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const { theme, toggleTheme } = useTheme();

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todos</h1>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? "☀" : "🌙"}
        </button>
      </header>
      <div className="add-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="What needs doing?"
        />
        <button onClick={add}>Add</button>
      </div>
      <ul>
        {todos.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <span onClick={() => toggle(t.id)}>{t.text}</span>
            <button onClick={() => remove(t.id)}>×</button>
          </li>
        ))}
      </ul>
      {todos.length > 0 && (
        <p className="count">
          {todos.filter((t) => !t.done).length} remaining
        </p>
      )}
    </div>
  );
}
