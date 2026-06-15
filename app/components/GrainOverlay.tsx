"use client";

/**
 * Shared film-grain texture — a pointer-through SVG noise wash. Rendered once
 * over the home slider so all three sections carry the SAME grain, and matched
 * to the case-study overlays so the texture is consistent site-wide. Defaults
 * to absolute (scoped to its positioned parent); pass a className to override
 * z-index/opacity placement.
 */
export default function GrainOverlay({ className = "z-30" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity: 0.05,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
