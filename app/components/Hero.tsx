"use client";

/**
 * Section 1 of the home slider — a single big statement, paper/ink themed so it
 * flips with the bat + colour picker. Copy is a first pass; tune freely (no em
 * dashes in the voice).
 */
export default function Hero() {
  return (
    <div
      className="section-invert relative flex h-full w-full flex-col items-center justify-center px-6 text-center"
      style={{ transition: "background-color 0.6s ease, color 0.6s ease" }}
    >
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
    </div>
  );
}
