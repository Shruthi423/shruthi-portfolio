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
  // `data-cursor-image` lets a hovered element show a preview image inside
  // the cursor pill instead of (or alongside) the text label. Used to give
  // the AI-video tab an actual AI-generated thumbnail at the cursor.
  const [image, setImage] = useState<string | null>(null);
  const [autoPillSide, setAutoPillSide] = useState<PillSide>("center");
  const [pillSideOverride, setPillSideOverride] = useState<PillSide | null>(
    null,
  );
  const hasMovedRef = useRef(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  // Snappier follow: higher stiffness + lower mass = tracks the mouse tightly
  // without the floaty trail, while damping keeps it from overshooting.
  const springX = useSpring(mouseX, { damping: 38, stiffness: 900, mass: 0.35 });
  const springY = useSpring(mouseY, { damping: 38, stiffness: 900, mass: 0.35 });

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

  // Re-read label + anchor + image override when the hovered element's
  // attributes change. `data-cursor-image` is a path (e.g. /foo/bar.jpg);
  // when present, the pill renders the image instead of the text label.
  useEffect(() => {
    if (!labeledEl) {
      setLabel(null);
      setImage(null);
      setPillSideOverride(null);
      return;
    }
    const read = () => {
      setLabel(labeledEl.getAttribute("data-cursor-label"));
      setImage(labeledEl.getAttribute("data-cursor-image"));
      setPillSideOverride(
        parsePillSide(labeledEl.getAttribute("data-cursor-anchor")),
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(labeledEl, {
      attributes: true,
      attributeFilter: ["data-cursor-label", "data-cursor-anchor", "data-cursor-image"],
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
        className="flex items-center justify-center overflow-hidden rounded-full"
        style={{
          // When an image preview is active, drop the pill background so
          // the image reads cleanly. Otherwise use the brand pill color.
          backgroundColor: image ? "transparent" : pillBg,
          transform: `translate(${translateX}, -50%)`,
          minWidth: 12,
          minHeight: 12,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.5 }}
      >
        <AnimatePresence initial={false} mode="wait">
          {image ? (
            // Image preview - replaces the text pill. Sized to feel like
            // a phone-screen thumbnail (it's an IG-style 9:16). Subtle
            // shadow + border so it reads on any background.
            <motion.div
              key={`img-${image}`}
              className="overflow-hidden rounded-2xl shadow-lg"
              style={{ border: `2px solid ${pillBg}`, height: 168, aspectRatio: "9 / 16" }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                draggable={false}
              />
            </motion.div>
          ) : label ? (
            <motion.span
              key="label"
              className="whitespace-nowrap px-4 py-1.5 font-mono uppercase tracking-wide"
              style={{ fontSize: 15, color: pillText }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
