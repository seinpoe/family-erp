"use client";

import { useEffect } from "react";
import { applyTheme, resolveTheme } from "@/lib/theme";

export function ThemeInitializer() {
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("theme");
    const stored = localStorage.getItem("hearthline-theme");
    applyTheme(resolveTheme(requested, stored, window.matchMedia("(prefers-color-scheme: dark)").matches));
  }, []);

  return null;
}
