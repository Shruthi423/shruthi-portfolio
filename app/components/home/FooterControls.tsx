"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme, PAPER_COLORS, PAPER_ORDER } from "@/app/components/shared/ThemeProvider";
import { BatToggle } from "@/app/components/layout/Background";

// Footer controls: background colour + light/dark (the bat). Rendered inline —
// FootprintsHome positions this cluster in the footer's bottom-right corner,
// beside the footprint picker. The colour picker is a fixed trigger showing the
// current swatch; clicking it fans the other swatches upward (the icon never
// moves), and choosing one collapses back to the same spot with the new colour
// on the trigger. Closes on outside click / Escape.
// Friendly cursor-pill names for each palette key.
const LABELS: Record<string, string> = {
  white: "Milk",
  blush: "Salmon",
  butter: "Butter",
  mint: "Avocado",
  sky: "Sky",
};
const label = (c: string) => LABELS[c] ?? c[0].toUpperCase() + c.slice(1);

export default function FooterControls() {
  const { color, setColor } = useTheme();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const others = PAPER_ORDER.filter((c) => c !== color);

  return (
    // data-quiet: no footprints spawn over the controls. stopPropagation keeps
    // clicks from reaching the footprint engine underneath. (The parent cluster
    // in FootprintsHome owns the corner positioning + pointer-events.)
    <div
      data-quiet
      className="flex h-9 items-center gap-3"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
    >
      <div ref={pickerRef} className="relative flex h-6 items-center">
        {/* other swatches — fan upward from the fixed trigger on click */}
        <div
          className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col items-center gap-2 transition-all duration-200"
          style={{
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transform: open ? "translate(-50%, 0)" : "translate(-50%, 6px)",
          }}
        >
          {others.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setOpen(false);
              }}
              aria-label={`${label(c)} background`}
              data-cursor-label={label(c)}
              tabIndex={open ? 0 : -1}
              className="h-6 w-6 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: PAPER_COLORS[c],
                boxShadow: "inset 0 0 0 1px color-mix(in srgb, currentColor 30%, transparent)",
              }}
            />
          ))}
        </div>

        {/* trigger — always the current colour, in a fixed position */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Choose background colour"
          aria-expanded={open}
          data-cursor-label={label(color)}
          className="h-6 w-6 rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: PAPER_COLORS[color], boxShadow: "0 0 0 1.5px currentColor" }}
        />
      </div>

      {/* light / dark — the bat: hangs upside-down by day, upright at night */}
      <BatToggle />
    </div>
  );
}
