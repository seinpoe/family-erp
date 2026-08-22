"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "hearthline-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(storageKey, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    const requested = new URLSearchParams(window.location.search).get("theme");
    const initialTheme: Theme = requested === "light" || requested === "dark" ? requested : saved === "light" || saved === "dark" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(initialTheme);
    setTheme(initialTheme);
  }, []);

  function chooseTheme(nextTheme: Theme) {
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex overflow-hidden border border-line bg-surface shadow-tactile-sm" role="group" aria-label="Color theme">
      <button type="button" aria-label="Use light theme" aria-pressed={theme === "light"} onClick={() => chooseTheme("light")} className={theme === "light" ? "grid size-11 place-items-center bg-brand text-white" : "grid size-11 place-items-center text-ink transition hover:bg-soft hover:text-brand"}><Sun className="size-4" aria-hidden="true" /></button>
      <button type="button" aria-label="Use dark theme" aria-pressed={theme === "dark"} onClick={() => chooseTheme("dark")} className={theme === "dark" ? "grid size-11 place-items-center bg-contrast text-white" : "grid size-11 place-items-center border-l border-line text-ink transition hover:bg-soft hover:text-brand"}><Moon className="size-4" aria-hidden="true" /></button>
    </div>
  );
}
