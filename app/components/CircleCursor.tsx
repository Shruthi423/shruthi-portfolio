"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const EDGE_THRESHOLD = 180;

// Earthy cursor — espresso pill + oat label by day; inverts to an oat pill +
// espresso label at night so it stays legible on the dark home.
const CURSOR_COLOR = "#3b2a1c"; // espresso
const CURSOR_LABEL = "#faf7f0"; // oat milk
const CURSOR_COLOR_DARK = "#eae0ce"; // oat pill at night
const CURSOR_LABEL_DARK = "#171520"; // warm-midnight ink

type PillSide = "left" | "center" | "right";

// Where the pill sits relative to the cursor → the translateX on the pill
const SIDE_TRANSLATE_X: Record<PillSide, string> = {
  left: "-100%", // pill extends to the left of the cursor
  right: "0%", // pill extends to the right of the cursor
  center: "-50%", // pill centered on the cursor
};

function parsePillSide(value: string | null): PillSide | null {
  return value === "left" || value === "right" || value === "center"
    ? value
    : null;
}

export function CircleCursor() {
  const { resolvedTheme } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [labeledEl, setLabeledEl] = useState<HTMLElement | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [autoPillSide, setAutoPillSide] = useState<PillSide>("center");
  const [pillSideOverride, setPillSideOverride] = useState<PillSide | null>(
    null,
  );
  const hasMovedRef = useRef(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 350, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 350, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setReady(true);
      }
      const w = window.innerWidth;
      setAutoPillSide((prev) => {
        // cursor near left viewport edge → pill to the RIGHT (stay onscreen)
        // cursor near right viewport edge → pill to the LEFT (stay onscreen)
        const next: PillSide =
          e.clientX < EDGE_THRESHOLD
            ? "right"
            : e.clientX > w - EDGE_THRESHOLD
              ? "left"
              : "center";
        return next !== prev ? next : prev;
      });
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      setLabeledEl(target.closest<HTMLElement>("[data-cursor-label]"));
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
    };
  }, [mouseX, mouseY]);

  // Re-read label + anchor override when the hovered element's attributes change.
  useEffect(() => {
    if (!labeledEl) {
      setLabel(null);
      setPillSideOverride(null);
      return;
    }
    const read = () => {
      setLabel(labeledEl.getAttribute("data-cursor-label"));
      setPillSideOverride(
        parsePillSide(labeledEl.getAttribute("data-cursor-anchor")),
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(labeledEl, {
      attributes: true,
      attributeFilter: ["data-cursor-label", "data-cursor-anchor"],
    });
    return () => observer.disconnect();
  }, [labeledEl]);

  if (!enabled || !ready) return null;

  const effectiveSide = pillSideOverride ?? autoPillSide;
  const translateX = SIDE_TRANSLATE_X[effectiveSide];
  const dark = resolvedTheme === "dark";
  const pillBg = dark ? CURSOR_COLOR_DARK : CURSOR_COLOR;
  const pillText = dark ? CURSOR_LABEL_DARK : CURSOR_LABEL;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        layout
        className="flex items-center justify-center rounded-full"
        style={{
          backgroundColor: pillBg,
          transform: `translate(${translateX}, -50%)`,
          minWidth: 12,
          minHeight: 12,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.5 }}
      >
        <AnimatePresence initial={false}>
          {label && (
            <motion.span
              key="label"
              className="whitespace-nowrap px-4 py-1.5 font-mono lowercase"
              style={{ fontSize: 15, color: pillText }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
