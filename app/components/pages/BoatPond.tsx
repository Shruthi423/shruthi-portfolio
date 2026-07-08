"use client";

import { useEffect, useRef, useState } from "react";
import { PAPER_COLORS, PAPER_ORDER } from "@/app/components/shared/ThemeProvider";

/**
 * An abstract line-pond in Playground: hand-drawn blue crayon waves on the bare
 * paper (no water fill), with paper boats that ride the current. Lines AND boats
 * are driven by ONE shared wave field in the same pixel space and the same clock
 * — every boat sits exactly on its assigned line's crest, so it rises, tilts, and
 * slides along the water it's actually drawn on (not a separate motion). Click the
 * water to float a new one (sometimes a rubber duck), each carrying a folded note.
 * Session-only, no backend.
 *
 * One requestAnimationFrame loop redraws the line paths and moves the boats (no
 * per-frame React render). Reduced-motion freezes the scene.
 */

const BLUES = ["#6fb0d8", "#5da4d1", "#4f97c8", "#4189bd", "#3b7fb0", "#356f9c"];

// The water: each line is a travelling sine. baseFrac = vertical position (frac
// of pond height); amp = px sway; L = wavelength px; v = drift px/s (sign = dir);
// phase offsets them. Boats ride these exact lines by index.
type Wave = {
  baseFrac: number;
  amp: number;
  L: number;
  v: number;
  phase: number;
  stroke: string;
  w: number;
  op: number;
  dash: boolean;
};

const LINES: Wave[] = [
  { baseFrac: 0.10, amp: 7, L: 420, v: 22, phase: 0.2, stroke: BLUES[0], w: 1.6, op: 0.35, dash: false },
  { baseFrac: 0.19, amp: 9, L: 520, v: -18, phase: 1.1, stroke: BLUES[1], w: 2.0, op: 0.45, dash: true },
  { baseFrac: 0.28, amp: 8, L: 360, v: 26, phase: 2.0, stroke: BLUES[2], w: 1.8, op: 0.4, dash: false },
  { baseFrac: 0.37, amp: 10, L: 480, v: -24, phase: 0.7, stroke: BLUES[3], w: 2.2, op: 0.5, dash: false },
  { baseFrac: 0.46, amp: 8, L: 400, v: 20, phase: 2.6, stroke: BLUES[4], w: 1.7, op: 0.4, dash: true },
  { baseFrac: 0.55, amp: 11, L: 560, v: -28, phase: 1.5, stroke: BLUES[2], w: 2.4, op: 0.5, dash: false },
  { baseFrac: 0.64, amp: 9, L: 440, v: 24, phase: 0.4, stroke: BLUES[3], w: 2.0, op: 0.45, dash: false },
  { baseFrac: 0.73, amp: 8, L: 380, v: -20, phase: 3.0, stroke: BLUES[4], w: 1.8, op: 0.4, dash: true },
  { baseFrac: 0.82, amp: 10, L: 500, v: 30, phase: 1.9, stroke: BLUES[5], w: 2.2, op: 0.5, dash: false },
  { baseFrac: 0.90, amp: 7, L: 340, v: -22, phase: 2.3, stroke: BLUES[5], w: 1.6, op: 0.35, dash: true },
];

const PTS = 30; // samples per line

type Boat = {
  id: number;
  color: string;
  size: number; // px width
  lineIndex: number; // which wave it rides
  startFrac: number; // initial x as fraction of pond width (also splash x)
  speed: number; // px/s drift along the line, sign = direction
  isNew: boolean;
  kind?: "boat" | "duck"; // undefined = paper boat
  note?: string; // folded-note word for boats you add; revealed on hover
};

// Deterministic starting fleet (no Math.random → SSR-safe, no hydration drift).
const SEED: Boat[] = [
  { id: 1, color: PAPER_COLORS.sky, size: 78, lineIndex: 2, startFrac: 0.12, speed: 14, isNew: false },
  { id: 2, color: PAPER_COLORS.blush, size: 96, lineIndex: 5, startFrac: 0.42, speed: -11, isNew: false },
  { id: 3, color: PAPER_COLORS.butter, size: 70, lineIndex: 0, startFrac: 0.68, speed: 17, isNew: false },
  { id: 4, color: PAPER_COLORS.mint, size: 86, lineIndex: 7, startFrac: 0.82, speed: -15, isNew: false },
  { id: 5, color: PAPER_COLORS.white, size: 64, lineIndex: 4, startFrac: 0.28, speed: 12, isNew: false },
  { id: 6, color: PAPER_COLORS.butter, size: 82, lineIndex: 8, startFrac: 0.55, speed: -13, isNew: false, kind: "duck" },
];

const MAX_BOATS = 24;

// Words a freshly added boat carries as a folded note (hover to read).
const NOTES = [
  "ahoy", "adrift", "hello", "onward", "float on", "bon voyage", "smooth seas",
  "ahead", "drifting", "wish", "keep going", "tiny", "still here", "hi", "sail",
];

// Wake: each boat drops a faint ripple behind it now and then as it drifts.
const WAKE_EVERY = 0.85; // seconds between a boat's wake drops

function PaperBoat({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 120 74" fill="none" className="block" aria-hidden>
      <g filter="url(#bp-crayon)">
        <path
          d="M4 34 Q60 50 116 34 L98 66 Q96 70 90 70 L30 70 Q24 70 22 66 Z"
          fill={color}
          stroke="#241f1a"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path
          d="M46 43 L61 20 L76 43 Z"
          fill={color}
          stroke="#241f1a"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M61 21 L61 49" stroke="#241f1a" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// A little rubber duck that rides the waves like the boats. Same bounding box as
// PaperBoat (size × 0.62) so the wave physics drop straight in. Always yellow.
function RubberDuck({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 120 74" fill="none" className="block" aria-hidden>
      <g filter="url(#bp-crayon)">
        <path
          d="M16 52 Q12 40 30 39 Q40 30 58 34 Q73 30 84 41 Q101 43 98 53 Q94 66 70 67 L40 67 Q20 65 16 52 Z"
          fill="#f5cf3d"
          stroke="#241f1a"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <circle cx="82" cy="26" r="15" fill="#f5cf3d" stroke="#241f1a" strokeWidth="2.6" />
        <path d="M95 23 L113 27 L95 32 Z" fill="#e8892f" stroke="#241f1a" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="85" cy="22" r="2.6" fill="#241f1a" />
        <path d="M40 51 Q56 45 72 51" stroke="#241f1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function BoatPond() {
  const [boats, setBoats] = useState<Boat[]>(SEED);
  const [noteDraft, setNoteDraft] = useState("");
  const [mode, setMode] = useState<"boat" | "duck">("boat");
  const boatsRef = useRef<Boat[]>(SEED);
  const boatEls = useRef<Map<number, HTMLElement>>(new Map());
  const lineEls = useRef<(SVGPathElement | null)[]>([]);
  const pondRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(SEED.length + 1);
  const wakeRef = useRef<HTMLDivElement>(null);
  const lastWake = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    boatsRef.current = boats;
  }, [boats]);

  useEffect(() => {
    const pond = pondRef.current;
    if (!pond) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = pond.clientWidth;
    let H = pond.clientHeight;
    const onResize = () => {
      W = pond.clientWidth;
      H = pond.clientHeight;
    };
    window.addEventListener("resize", onResize);

    // Redraw one line's path from the wave function at time t (px space).
    const drawLine = (i: number, t: number) => {
      const el = lineEls.current[i];
      if (!el) return;
      const ln = LINES[i];
      const k = (2 * Math.PI) / ln.L;
      const omega = k * ln.v;
      const base = ln.baseFrac * H;
      let d = "";
      for (let p = 0; p <= PTS; p++) {
        const x = (p / PTS) * W;
        const y = base + ln.amp * Math.sin(k * x - omega * t + ln.phase);
        d += `${p === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      el.setAttribute("d", d);
    };

    // Drop a single faint ripple into the wake layer, then clean it up.
    const spawnWake = (x: number, y: number, size: number) => {
      const layer = wakeRef.current;
      if (!layer) return;
      const s = document.createElement("span");
      s.className = "bp-wake";
      const w = Math.round(size * 0.5);
      s.style.left = `${x.toFixed(1)}px`;
      s.style.top = `${y.toFixed(1)}px`;
      s.style.width = `${w}px`;
      s.style.height = `${Math.max(4, Math.round(w * 0.32))}px`;
      layer.appendChild(s);
      window.setTimeout(() => s.remove(), 950);
    };

    // Place one boat exactly on its line at time t.
    const placeBoat = (b: Boat, t: number) => {
      const el = boatEls.current.get(b.id);
      if (!el) return;
      const ln = LINES[b.lineIndex];
      const k = (2 * Math.PI) / ln.L;
      const omega = k * ln.v;
      const range = W + b.size * 2;
      const cx = (((b.startFrac * W + b.speed * t) % range) + range) % range - b.size;
      const arg = k * cx - omega * t + ln.phase;
      const y = ln.baseFrac * H + ln.amp * Math.sin(arg);
      const slope = ln.amp * k * Math.cos(arg);
      const tilt = (Math.atan(slope) * 180) / Math.PI;

      // Wake: drop a sparse ripple just astern of the drifting boat.
      if (!reduce) {
        const prev = lastWake.current.get(b.id) ?? -Infinity;
        if (t - prev > WAKE_EVERY) {
          lastWake.current.set(b.id, t);
          const dir = b.speed >= 0 ? 1 : -1;
          spawnWake(cx - dir * b.size * 0.42, y + b.size * 0.03, b.size);
        }
      }

      el.style.transform = `translate(${(cx - b.size / 2).toFixed(1)}px, ${(y - b.size * 0.5).toFixed(1)}px) rotate(${tilt.toFixed(2)}deg)`;
    };

    if (reduce) {
      const layout = () => {
        LINES.forEach((_, i) => drawLine(i, 0));
        boatsRef.current.forEach((b) => placeBoat(b, 0));
      };
      layout();
      const id = window.setInterval(layout, 400); // catch newly added boats
      return () => {
        window.clearInterval(id);
        window.removeEventListener("resize", onResize);
      };
    }

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const t = (now - start) / 1000;
      for (let i = 0; i < LINES.length; i++) drawLine(i, t);
      for (const b of boatsRef.current) placeBoat(b, t);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Nearest line to a vertical fraction, so a dropped boat snaps onto real water.
  const nearestLine = (frac: number) => {
    let best = 0;
    let bestD = Infinity;
    LINES.forEach((ln, i) => {
      const d = Math.abs(ln.baseFrac - frac);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const addBoat = (at: { fx: number; fy: number }, note: string, kind: "boat" | "duck") => {
    const id = nextId.current++;
    const palette = PAPER_ORDER[Math.floor(Math.random() * PAPER_ORDER.length)];
    const boat: Boat = {
      id,
      color: PAPER_COLORS[palette],
      size: 66 + Math.random() * 28,
      lineIndex: nearestLine(at.fy),
      startFrac: at.fx,
      speed: (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 9),
      isNew: true,
      kind,
      note,
    };
    setBoats((prev) => {
      const next = [...prev, boat];
      return next.length > MAX_BOATS ? next.slice(next.length - MAX_BOATS) : next;
    });
  };

  const setBoatRef = (id: number) => (el: HTMLDivElement | null) => {
    if (el) boatEls.current.set(id, el);
    else {
      boatEls.current.delete(id);
      lastWake.current.delete(id);
    }
  };

  // Click the water to float a boat in right where you tapped, carrying whatever
  // note is typed (or a random word if the field is empty).
  const onPondClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const fx = Math.min(0.95, Math.max(0.05, (e.clientX - r.left) / r.width));
    const fy = Math.min(0.92, Math.max(0.08, (e.clientY - r.top) / r.height));
    const note = noteDraft.trim() || NOTES[Math.floor(Math.random() * NOTES.length)];
    addBoat({ fx, fy }, note, mode);
    setNoteDraft("");
  };

  return (
    <div>
      {/* Shared crayon filters (referenced by id from the SVGs below). */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="bp-crayon" x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="bp-crayon-wave" x="-5%" y="-60%" width="110%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.09" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <style>{`
        @keyframes bp-drop   { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes bp-ripple {
          0%   { transform: translate(-50%,-50%) scale(0.35); opacity: 0; }
          18%  { opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; }
        }
        @keyframes bp-wake {
          0%   { transform: translate(-50%,-50%) scaleX(0.5); opacity: 0.4; }
          100% { transform: translate(-50%,-50%) scaleX(1.3); opacity: 0; }
        }
        .bp-drop   { animation: bp-drop 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .bp-ripple { animation: bp-ripple 1.2s ease-out 0.12s both; }
        .bp-wake   { position: absolute; border-radius: 50%; border: 1px solid #3b7fb0; will-change: transform, opacity; animation: bp-wake 0.9s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .bp-drop, .bp-ripple, .bp-wake { animation: none; }
          .bp-ripple, .bp-wake { opacity: 0; }
        }
      `}</style>

      {/* controls — pick boat or duck, then type a note; both ride in on your next click */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-caption-1 uppercase tracking-wide text-muted">Add</span>
          {(["boat", "duck"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              aria-label={m === "boat" ? "Drop paper boats" : "Drop rubber ducks"}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-opacity ${mode === m ? "opacity-100" : "opacity-35 hover:opacity-70"}`}
              style={mode === m ? { boxShadow: "inset 0 0 0 2px var(--ink)" } : undefined}
            >
              {m === "boat" ? <PaperBoat color="var(--paper)" size={26} /> : <RubberDuck size={26} />}
            </button>
          ))}
        </div>
        <div className="flex min-w-[12rem] flex-1 items-center gap-x-3">
          <label htmlFor="bp-note" className="font-mono text-caption-1 uppercase tracking-wide text-muted">
            Note
          </label>
          <input
            id="bp-note"
            type="text"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            maxLength={24}
            placeholder="say something, then click the water"
            className="min-w-0 flex-1 border-b border-[var(--ink)]/30 bg-transparent pb-1 font-mono text-caption-1 tracking-wide text-[var(--ink)] placeholder:text-muted focus:border-[var(--ink)] focus:outline-none"
          />
        </div>
      </div>

      {/* the pond — transparent; only the crayon lines + boats show */}
      <div
        ref={pondRef}
        onClick={onPondClick}
        className="relative h-[300px] w-full cursor-pointer overflow-hidden rounded-2xl sm:h-[380px]"
      >
        {/* all water lines in one px-space SVG, redrawn each frame */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <g filter="url(#bp-crayon-wave)">
            {LINES.map((ln, i) => (
              <path
                key={i}
                ref={(el) => {
                  lineEls.current[i] = el;
                }}
                fill="none"
                stroke={ln.stroke}
                strokeWidth={ln.w}
                strokeOpacity={ln.op}
                strokeLinecap="round"
                strokeDasharray={ln.dash ? "9 15" : undefined}
              />
            ))}
          </g>
        </svg>

        {/* wake ripples, dropped astern each boat by the rAF loop (behind the fleet) */}
        <div ref={wakeRef} className="pointer-events-none absolute inset-0" aria-hidden />

        {/* splash ripples for freshly added boats, on their line */}
        {boats
          .filter((b) => b.isNew)
          .map((b) => (
            <span
              key={`ripple-${b.id}`}
              className="bp-ripple pointer-events-none absolute rounded-[50%] border border-[#245a78]"
              style={{
                left: `${b.startFrac * 100}%`,
                top: `${LINES[b.lineIndex].baseFrac * 100}%`,
                width: `${Math.round(b.size * 0.95)}px`,
                height: `${Math.round(b.size * 0.3)}px`,
              }}
            />
          ))}

        {/* the fleet — positioned entirely by the rAF loop */}
        {boats.map((b) => (
          <div key={b.id} ref={setBoatRef(b.id)} className="group absolute left-0 top-0 will-change-transform">
            <div className={`relative ${b.isNew ? "bp-drop" : ""}`}>
              {b.kind === "duck" ? <RubberDuck size={b.size} /> : <PaperBoat color={b.color} size={b.size} />}
              {b.note && (
                <>
                  {/* folded-note marker — a little paper tab; hover reveals the word */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[1px]"
                    style={{ background: "var(--paper)", boxShadow: "inset 0 0 0 1.5px #241f1a" }}
                  />
                  <span
                    className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-caption-2 uppercase tracking-wide opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ background: "var(--paper)", color: "var(--ink)", boxShadow: "inset 0 0 0 1.5px var(--ink)" }}
                  >
                    {b.note}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
