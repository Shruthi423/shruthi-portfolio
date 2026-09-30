"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FOOTPRINT_ANIMALS,
  footprintTileSvg,
  type FootprintAnimal,
} from "@/app/lib/footprints";

/**
 * Site-wide taste settings. Currently one: which critter's tracks the footprint
 * layers lay down.
 *
 * This replaced ThemeProvider. The portfolio is light-only now, so there is no
 * theme left to provide — no light/dark state, no system-preference listener,
 * no `.dark` class. The footer is dark because FootprintsHome paints it that
 * way via `inverted`, not because of a global polarity.
 *
 * The chosen animal lives here rather than in FootprintsHome because the hero
 * and the footer each mount their own copy of that component: local state would
 * let them drift apart and would reset on every navigation.
 */

const DEFAULT_FOOTPRINT: FootprintAnimal = "lion";
const FOOTPRINT_KEY = "footprint-animal";

type FootprintContextValue = {
  footprint: FootprintAnimal;
  setFootprint: (animal: FootprintAnimal) => void;
};

const FootprintContext = createContext<FootprintContextValue | undefined>(
  undefined,
);

function readStoredFootprint(): FootprintAnimal {
  try {
    const stored = localStorage.getItem(FOOTPRINT_KEY);
    if (stored && (FOOTPRINT_ANIMALS as readonly string[]).includes(stored)) {
      return stored as FootprintAnimal;
    }
  } catch {}
  return DEFAULT_FOOTPRINT;
}

// Dynamic favicon: the lion track, in the signature gradient, no background —
// the same mark the cursor leaves. Always the lion, regardless of which
// animal is chosen elsewhere on the site; painted once on mount.
function applyFavicon() {
  const svg = footprintTileSvg();
  const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  const head = document.head;
  // Drop the static link from layout.tsx so only the live tile remains.
  head.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove());
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/svg+xml";
  link.href = href;
  head.appendChild(link);
}

export function FootprintProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [footprint, setFootprintState] =
    useState<FootprintAnimal>(DEFAULT_FOOTPRINT);

  useEffect(() => {
    setFootprintState(readStoredFootprint());
  }, []);

  useEffect(() => {
    applyFavicon();
  }, []);

  const setFootprint = useCallback((next: FootprintAnimal) => {
    setFootprintState(next);
    try {
      localStorage.setItem(FOOTPRINT_KEY, next);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ footprint, setFootprint }),
    [footprint, setFootprint],
  );

  return (
    <FootprintContext.Provider value={value}>
      {children}
    </FootprintContext.Provider>
  );
}

export function useFootprint() {
  const ctx = useContext(FootprintContext);
  if (!ctx) {
    throw new Error("useFootprint must be used inside <FootprintProvider>");
  }
  return ctx;
}
