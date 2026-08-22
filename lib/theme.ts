export type Theme = "light" | "dark";

export function resolveTheme(requested: string | null, stored: string | null, prefersDark: boolean): Theme {
  if (requested === "light" || requested === "dark") return requested;
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("hearthline-theme", theme);
}
