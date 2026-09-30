"use client";

import type { CSSProperties } from "react";

/**
 * The doodle that lands with the hero's rotating verb.
 *
 * One hand-drawn mark per word, stroked on in the word's own hue a beat after
 * the word arrives, wiped the instant it leaves. The point is that the flip
 * stops being a crossfade and starts being a little performance: the sentence
 * is still dead still, and something keeps drawing itself around it.
 *
 * Three rules this file exists to keep:
 *
 *  - Nothing here can move the sentence. Every doodle is absolutely positioned
 *    off the verb's own slot, so it is out of flow and the pinned slot width in
 *    RotatingWord stays the only thing sizing the line.
 *  - Everything is sized in `em`, never px. The headline is a viewport clamp
 *    (1.15rem → 3.25rem), so a doodle measured in px would be a scrawl on a
 *    phone and a hairline on a display. In em it tracks the type.
 *  - No doodle is stretched. They all keep their aspect ratio, which means the
 *    full-width marks get a touch heavier under a long word like "Prototyping"
 *    and lighter under "Building" — that variation reads as hand-made, and it
 *    is the reason none of them need `preserveAspectRatio="none"` and the
 *    stroke distortion that comes with it.
 *
 * The marks alternate above and below the line on purpose. Nine underlines in
 * a row would read as a tic; a coil overhead, then a measurement line beneath,
 * then a burst off the shoulder reads as restlessness.
 */

/** The stroke-on, once the word itself has landed. */
const START_MS = 150;
const DRAW_MS = 460;
/** Each stroke waits this much longer than the one before it. */
const STAGGER_MS = 70;
/** Leaving is faster than arriving — the doodle gets out of the way. */
const EXIT_MS = 170;

type Stroke = { d: string; width?: number };
type Dot = { cx: number; cy: number; r: number };

type Doodle = {
  viewBox: string;
  /** Where the mark hangs off the verb's slot. Absolute, em-based. */
  style: CSSProperties;
  strokeWidth: number;
  strokes: Stroke[];
  dots?: Dot[];
};

/** Hangs under the word, as wide as the word. */
const below: CSSProperties = { left: 0, width: "100%", top: "100%", marginTop: "-0.06em" };
/** Rides over the word, as wide as the word. */
const above: CSSProperties = { left: 0, width: "100%", bottom: "100%", marginBottom: "0.02em" };
/** Sits off the word's top-right shoulder, at its own fixed size. */
const shoulder = (size: string): CSSProperties => ({
  right: "-0.1em",
  bottom: "100%",
  width: size,
  marginBottom: "-0.04em",
});

export const DOODLES: Record<string, Doodle> = {
  // A spring, overhead, mid-bounce.
  Tinkering: {
    viewBox: "0 0 160 18",
    style: above,
    strokeWidth: 1.8,
    strokes: [
      {
        d: "M4 14 C 8 2, 22 2, 25 12 C 28 2, 42 2, 45 12 C 48 2, 62 2, 65 12 C 68 2, 82 2, 85 12 C 88 2, 102 2, 105 12 C 108 2, 122 2, 125 12 C 128 3, 142 3, 145 11 C 147 5, 153 6, 157 9",
      },
    ],
  },
  // A spiral winding inward, which is what pondering actually feels like.
  Pondering: {
    viewBox: "0 0 40 40",
    style: shoulder("0.85em"),
    strokeWidth: 3,
    strokes: [
      {
        d: "M8 8 C 18 0, 33 5, 35 17 C 37 29, 26 38, 16 33 C 8 29, 10 18, 19 16 C 27 14, 33 22, 30 29",
      },
    ],
  },
  // Three dots climbing away from the word: a thought leaving the sentence.
  Wondering: {
    viewBox: "0 0 44 32",
    style: shoulder("1em"),
    strokeWidth: 3,
    strokes: [],
    dots: [
      { cx: 7, cy: 26, r: 3 },
      { cx: 21, cy: 16, r: 4.2 },
      { cx: 37, cy: 6, r: 5.6 },
    ],
  },
  // The scribble you make when you are not committing to anything yet.
  Sketching: {
    viewBox: "0 0 160 16",
    style: below,
    strokeWidth: 1.8,
    strokes: [
      {
        d: "M3 5 L 17 13 L 31 5 L 45 13 L 59 5 L 73 13 L 87 5 L 101 13 L 115 5 L 129 13 L 143 5 L 157 11",
      },
    ],
  },
  // A question mark, drawn badly on purpose.
  Questioning: {
    viewBox: "0 0 28 40",
    style: shoulder("0.62em"),
    strokeWidth: 3,
    strokes: [{ d: "M4 11 C 5 3, 15 0, 20 5 C 26 11, 19 17, 15 21 C 12 24, 12 26, 12 29" }],
    dots: [{ cx: 12, cy: 36, r: 2.6 }],
  },
  // Shards flying off, each one a beat behind the last, so it pops rather than
  // appears. The gap at the centre is what makes it read as a burst.
  Breaking: {
    viewBox: "0 0 40 40",
    style: shoulder("0.8em"),
    strokeWidth: 3,
    strokes: [
      { d: "M20 5 L 20 13" },
      { d: "M32 9 L 26 15" },
      { d: "M36 21 L 28 21" },
      { d: "M31 33 L 26 26" },
      { d: "M9 32 L 15 25" },
      { d: "M4 20 L 12 20" },
      { d: "M8 8 L 14 14" },
    ],
  },
};

export default function VerbDoodle({
  word,
  color,
  active,
  calm,
}: {
  word: string;
  /** The verb's own hue, so the mark never disagrees with the word. */
  color: string;
  active: boolean;
  /** Reduced motion: the mark is simply there, fully drawn, no stroke-on. */
  calm: boolean;
}) {
  const doodle = DOODLES[word];
  if (!doodle) return null;

  // Normalised path lengths let one dash pair drive every stroke regardless of
  // how long the path actually is — so a 150-unit sweep and an 8-unit shard
  // draw over the same duration.
  const hidden = calm ? 0 : active ? 0 : 1.05;

  return (
    <svg
      viewBox={doodle.viewBox}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none absolute overflow-visible"
      style={{
        ...doodle.style,
        height: "auto",
        opacity: active ? 1 : 0,
        transition: calm ? "none" : `opacity ${active ? DRAW_MS : EXIT_MS}ms ease`,
      }}
    >
      {doodle.strokes.map((stroke, i) => (
        <path
          key={stroke.d}
          d={stroke.d}
          pathLength={1}
          strokeWidth={stroke.width ?? doodle.strokeWidth}
          strokeDasharray="1.05"
          strokeDashoffset={hidden}
          style={{
            transition: calm
              ? "none"
              : `stroke-dashoffset ${active ? DRAW_MS : EXIT_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${
                  active ? START_MS + i * STAGGER_MS : 0
                }ms`,
          }}
        />
      ))}
      {doodle.dots?.map((dot, i) => (
        <circle
          key={`${dot.cx}-${dot.cy}`}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={color}
          stroke="none"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: calm || active ? "scale(1)" : "scale(0)",
            transition: calm
              ? "none"
              : `transform ${active ? DRAW_MS : EXIT_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${
                  active ? START_MS + (doodle.strokes.length + i) * STAGGER_MS : 0
                }ms`,
          }}
        />
      ))}
    </svg>
  );
}
