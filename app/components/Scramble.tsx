"use client";

import { useEffect, useState } from "react";

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type Props = {
  text: string;
  /** Total duration for the last letter to lock in (ms). */
  duration?: number;
  /** Gap between successive letters locking (ms). */
  stagger?: number;
  /** Interval between random-char ticks (ms). */
  tickMs?: number;
  className?: string;
};

/**
 * Cycles each letter through random characters, left-to-right staggered,
 * before settling on the target string.
 */
export function Scramble({
  text,
  duration = 1500,
  stagger = 140,
  tickMs = 55,
  className,
}: Props) {
  // Deterministic initial scramble — same on server and client (SSR-safe),
  // so there's no hydration mismatch and no flash of the target text.
  const [display, setDisplay] = useState<string[]>(() =>
    text.split("").map((ch, i) =>
      ch === " " ? " " : POOL[(i * 7 + 3) % POOL.length],
    ),
  );

  useEffect(() => {
    const chars = text.split("");
    const locked = new Array(chars.length).fill(false);

    // Letter i locks at `duration - (n-1-i) * stagger` so the last letter lands at `duration`.
    const lockTimers = chars.map((target, i) => {
      if (target === " ") {
        locked[i] = true;
        return null;
      }
      const lockAt = Math.max(0, duration - (chars.length - 1 - i) * stagger);
      return window.setTimeout(() => {
        locked[i] = true;
        setDisplay((prev) => {
          const next = [...prev];
          next[i] = target;
          return next;
        });
      }, lockAt);
    });

    const tick = window.setInterval(() => {
      setDisplay((prev) =>
        prev.map((ch, i) =>
          locked[i]
            ? chars[i]
            : POOL[Math.floor(Math.random() * POOL.length)],
        ),
      );
    }, tickMs);

    const stop = window.setTimeout(() => {
      window.clearInterval(tick);
      // Ensure final state is exactly the target.
      setDisplay(chars);
    }, duration + 40);

    return () => {
      lockTimers.forEach((t) => t !== null && window.clearTimeout(t));
      window.clearInterval(tick);
      window.clearTimeout(stop);
    };
  }, [text, duration, stagger, tickMs]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{display.join("")}</span>
    </span>
  );
}
