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

// Phosphor paw, 256 viewBox — shared with the static favicon files.
const PAW_PATH =
  "M240,108a28,28,0,1,1-28-28A28,28,0,0,1,240,108ZM72,108a28,28,0,1,0-28,28A28,28,0,0,0,72,108ZM92,88A28,28,0,1,0,64,60,28,28,0,0,0,92,88Zm72,0a28,28,0,1,0-28-28A28,28,0,0,0,164,88Zm23.12,60.86a35.3,35.3,0,0,1-16.87-21.14,44,44,0,0,0-84.5,0A35.25,35.25,0,0,1,69,148.82,40,40,0,0,0,88,224a39.48,39.48,0,0,0,15.52-3.13,64.09,64.09,0,0,1,48.87,0,40,40,0,0,0,34.73-72Z";

// Dynamic favicon: a two-tone tile (paper bg + ink paw) so the chosen pastel
// shows in BOTH modes — pastel tile/charcoal paw in light, charcoal tile/pastel
// paw in dark. Updated live on every color + light/dark change.
function applyFavicon(color: PaperColor, dark: boolean) {
  const hue = PAPER_COLORS[color];
  const paper = dark ? CHARCOAL : hue;
  const ink = dark ? hue : CHARCOAL;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">` +
    `<rect width="256" height="256" rx="60" fill="${paper}"/>` +
    `<path d="${PAW_PATH}" fill="${ink}"/></svg>`;
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  const head = document.head;
  // Drop any existing icon links (the static media-query ones) so only the
  // live tile remains.
  head.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.href = href;
  head.appendChild(link);
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

  // Keep the favicon in sync with the chosen pastel + polarity.
  useEffect(() => {
    applyFavicon(color, resolvedTheme === "dark");
  }, [color, resolvedTheme]);

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
