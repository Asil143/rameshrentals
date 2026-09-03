"use client";

import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const nextDark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-surface-raised text-base shadow-soft transition hover:border-[var(--color-brand-500)]"
    >
      <span aria-hidden className="theme-icon-light">☾</span>
      <span aria-hidden className="theme-icon-dark">☀</span>
    </button>
  );
}
