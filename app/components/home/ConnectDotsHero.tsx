"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// PLACEHOLDER dot layouts. These are generic stand-ins (a star, a zigzag) so
// the interaction — click dots in order, watch each line draw itself in —
// can be built and tested now. Swap `dots` below with real coordinates traced
// from Shruthi's actual character sketches (rocket guy / sheep+dog / bird /
// marshmallow guy) once those exist as vector art; nothing else here needs to
// change. `dots[0]` is the start point and is shown already connected.
type Shape = { id: string; viewBox: string; dots: [number, number][] };

const SHAPES: Shape[] = [
  {
    id: "star",
    viewBox: "0 0 200 200",
    dots: [
      [100, 20],
      [124, 78],
      [186, 78],
      [136, 116],
      [156, 178],
      [100, 142],
      [44, 178],
      [64, 116],
      [14, 78],
      [76, 78],
    ],
  },
  {
    id: "wave",
    viewBox: "0 0 240 160",
    dots: [
      [20, 120],
      [55, 60],
      [90, 120],
      [125, 60],
      [160, 120],
      [195, 60],
      [220, 100],
    ],
  },
];

const GREETING = "Hi, I’m Shruthi.";

/** Connect-the-dots hero moment: click the dots in order to draw the shape,
 * then it says hi. Sits above the rest of the hero. */
export default function ConnectDotsHero() {
  const [shape, setShape] = useState<Shape | null>(null);
  const [progress, setProgress] = useState(1); // dots[0] starts already "connected"
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
  }, []);

  if (!shape) return <div className="h-[280px] w-full" aria-hidden />;

  const total = shape.dots.length;

  function handleDotClick(index: number) {
    if (done || index !== progress) return;
    const next = progress + 1;
    setProgress(next);
    if (next === total) {
      window.setTimeout(() => setDone(true), reduceMotion ? 0 : 450);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1140px] flex-col items-center px-6 pt-16 md:pt-20">
      <p className="mb-4 h-4 font-mono text-caption-2 uppercase tracking-[0.1em] text-muted">
        {done ? GREETING : "Connect the dots"}
      </p>
      <svg
        viewBox={shape.viewBox}
        className="h-[220px] w-full max-w-[320px]"
        role="img"
        aria-label="Connect the dots to say hi"
      >
        {shape.dots.slice(0, progress - 1).map((point, i) => {
          const next = shape.dots[i + 1];
          return (
            <motion.line
              key={`${shape.id}-line-${i}`}
              x1={point[0]}
              y1={point[1]}
              x2={next[0]}
              y2={next[1]}
              stroke="var(--text)"
              strokeWidth={3}
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          );
        })}
        {shape.dots.map(([x, y], i) => {
          const isNext = i === progress && !done;
          const isDone = i < progress;
          return (
            <circle
              key={`${shape.id}-dot-${i}`}
              cx={x}
              cy={y}
              r={isNext ? 7 : 5}
              fill={isNext ? "var(--accent)" : isDone ? "var(--text)" : "var(--muted)"}
              opacity={isDone || isNext ? 1 : 0.45}
              onClick={() => handleDotClick(i)}
            />
          );
        })}
      </svg>
    </div>
  );
}
