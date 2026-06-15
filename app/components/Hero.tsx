"use client";

import FootprintsHome from "./FootprintsHome";

/**
 * Section 1 of the home slider — the SAME frosted-glass + footprint engine as
 * the home, but at the opposite (inverted) polarity, with a single big
 * statement centered over it. Copy is a first pass (no em dashes in the voice).
 */
export default function Hero() {
  return (
    <FootprintsHome variant="hero">
      <p
        className="max-w-[22ch] text-balance lowercase"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: "clamp(1.75rem, 4.6vw, 3.5rem)",
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
        }}
      >
        A multidisciplinary designer who loves storytelling, craft, and making
        products easy to use.
      </p>

      <span className="mt-14 font-mono text-caption-1 uppercase tracking-[0.2em] opacity-50">
        Scroll
      </span>
    </FootprintsHome>
  );
}
