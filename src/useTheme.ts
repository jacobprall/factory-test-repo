import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage blocked — the choice simply is not persisted */
  }
}

function systemPrefersDark(): boolean {
  return window.matchMedia?.(DARK_QUERY).matches ?? false;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => readStoredTheme() ?? (systemPrefersDark() ? "dark" : "light"),
  );
  const [explicit, setExplicit] = useState(() => readStoredTheme() !== null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Follow the OS only while the user has made no explicit choice.
    if (explicit) return;
    const mql = window.matchMedia?.(DARK_QUERY);
    if (!mql) return;
    const onChange = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [explicit]);

  const toggleTheme = useCallback(() => {
    // Persist outside the state updater: updaters must stay pure because
    // React may invoke them more than once per render.
    const next: Theme = theme === "dark" ? "light" : "dark";
    writeStoredTheme(next);
    setTheme(next);
    setExplicit(true);
  }, [theme]);

  return { theme, toggleTheme };
}
