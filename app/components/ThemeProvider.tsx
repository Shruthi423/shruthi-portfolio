"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

// The five "paper" pastels — the picker options. Each is the chosen hue: it's
// the background in light mode and the ink (text/marks) in dark mode. Charcoal
// is the constant partner, set in globals.css.
export const PAPER_COLORS = {
  white: "#fbfbf9",
  blush: "#f4ccd0",
  butter: "#fbe9a8",
  mint: "#cdebc5",
  sky: "#c8e8f6",
} as const;
export type PaperColor = keyof typeof PAPER_COLORS;
export const PAPER_ORDER: PaperColor[] = [
  "white",
  "blush",
  "butter",
  "mint",
  "sky",
];
export const CHARCOAL = "#17171b";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  color: PaperColor;
  setColor: (color: PaperColor) => void;
};

const STORAGE_KEY = "theme";
const COLOR_KEY = "paper-color";
const DEFAULT_COLOR: PaperColor = "white";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {}
  return "system";
}

function readStoredColor(): PaperColor {
  try {
    const stored = localStorage.getItem(COLOR_KEY);
    if (stored && stored in PAPER_COLORS) return stored as PaperColor;
  } catch {}
  return DEFAULT_COLOR;
}

function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
}

function applyHue(color: PaperColor) {
  document.documentElement.style.setProperty("--hue", PAPER_COLORS[color]);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [color, setColorState] = useState<PaperColor>(DEFAULT_COLOR);

  useEffect(() => {
    setThemeState(readStoredTheme());
    setSystemTheme(getSystemTheme());
    const storedColor = readStoredColor();
    setColorState(storedColor);
    applyHue(storedColor);

    const mql = window.matchMedia(MEDIA_QUERY);
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const setColor = useCallback((next: PaperColor) => {
    setColorState(next);
    applyHue(next);
    try {
      localStorage.setItem(COLOR_KEY, next);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, color, setColor }),
    [theme, resolvedTheme, setTheme, color, setColor],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
