"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { gsap } from "@/app/lib/gsap";
import {
  useTheme,
  PAPER_COLORS,
  PAPER_ORDER,
  CHARCOAL,
} from "@/app/components/shared/ThemeProvider";
import { isSplashLifted, onSplashLift, splashWillPlay } from "@/app/lib/splash";

// hex → "r,g,b" so the canvas can build rgba() veils/tints from a flat hex.
const rgbTriplet = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h,
    16,
  );
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

// Palette + footprint colors live below the Animal type (LIGHT / DARK), since
// the frost + prints are drawn on a 2D canvas — they need real color values
// (not CSS vars), so the two themes are defined as plain objects and swapped.

const LINKS = [
  { label: "Work", href: "/#work", cursor: "Okay, the actual work" },
  { label: "Playground", href: "/playground", cursor: "Off-the-record" },
  { label: "About", href: "/about", cursor: "Who's Shruthi?" },
] as const;

// Five characterful tracks, one per picker slot. (Monochrome now — the print
// color is the theme's ink, not a per-animal hue.)
const ANIMALS = ["lion", "giraffe", "duck", "hippo", "zebra"] as const;
type Animal = (typeof ANIMALS)[number];

// Live two-tone palette the canvas reads each frame. `ink` is the print/chrome
// color; `bg` is the paper; `fog` is the paper at veil alpha.
type Palette = {
  bg: string;
  fog: string;
  ink: string;
  pickerActive: string; // active picker chip tint (ink, low alpha)
};

const SIZE: Record<Animal, number> = {
  lion: 1.0,
  giraffe: 1.2,
  duck: 1.0,
  hippo: 1.45,
  zebra: 0.95,
};

const POOL = 44;
// Realistic-ish gait: stride (px between steps) + track width per animal.
const STRIDE: Record<Animal, number> = {
  giraffe: 146,
  lion: 108,
  duck: 72,
  hippo: 150,
  zebra: 96,
};
const FOOTW: Record<Animal, number> = {
  giraffe: 18,
  lion: 14,
  duck: 11,
  hippo: 20,
  zebra: 14,
};
const SPEED_MAX = 2.0; // px/ms above which a step reads as "light"
const WIPE_R = 85;
const REFOG_MS = 1700;
const WIPE_MIN = 14; // min cursor travel between fog wipes
const GRAIN = 0; // frost speckle removed — the home section stays grain-free
const QUIET_FADE = 110; // px band around the menu where prints/wipes ramp down
const QUIET_PAD = 40; // padding around the link box that stays calm
// Minimum pocket so tiny chrome (wordmark, icons) gets the same calm as the links.
const QUIET_MIN_HW = 95; // min half-width
const QUIET_MIN_HH = 55; // min half-height

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const rectDist = (
  x: number,
  y: number,
  b: { left: number; top: number; right: number; bottom: number },
) => {
  const dx = Math.max(b.left - x, 0, x - b.right);
  const dy = Math.max(b.top - y, 0, y - b.bottom);
  return Math.hypot(dx, dy);
};

type Wipe = { x: number; y: number; s: number; r: number };

// Track shapes — shared by the cursor prints and the picker icons.
function shapeChildren(animal: Animal) {
  switch (animal) {
    case "lion":
      return (
        <>
          <ellipse cx="50" cy="74" rx="27" ry="23" />
          <ellipse cx="20" cy="42" rx="9" ry="13" />
          <ellipse cx="41" cy="27" rx="9" ry="14" />
          <ellipse cx="62" cy="27" rx="9" ry="14" />
          <ellipse cx="81" cy="42" rx="9" ry="13" />
        </>
      );
    case "giraffe":
      return (
        <>
          <ellipse cx="37" cy="58" rx="14" ry="40" transform="rotate(-7 37 58)" />
          <ellipse cx="63" cy="58" rx="14" ry="40" transform="rotate(7 63 58)" />
        </>
      );
    case "hippo":
      return (
        <path d="M50 10 C64 10 71 21 67 31 C66 35 65 36 72 41 C84 47 84 61 77 76 C72 89 69 99 58 99 C53 99 51 91 50 84 C49 91 47 99 42 99 C31 99 28 89 23 76 C16 61 16 47 28 41 C35 36 34 35 33 31 C29 21 36 10 50 10 Z" />
      );
    case "zebra":
      return (
        <path d="M30 13 C36 16 44 30 49 48 Q50 53 51 48 C56 30 64 16 70 13 C80 16 84 40 83 60 C82 82 72 99 50 99 C28 99 18 82 17 60 C16 40 20 16 30 13 Z" />
      );
    case "duck":
      return <path d="M50 95 L26 32 Q40 47 50 30 Q60 47 74 32 Z" />;
  }
}

function PawShapes() {
  const cls = "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  return (
    <>
      {ANIMALS.map((a) => (
        <svg
          key={a}
          data-shape={a}
          viewBox="0 0 100 110"
          width={64}
          height={70}
          fill="currentColor"
          className={cls}
          style={{ display: "none" }}
        >
          {shapeChildren(a)}
        </svg>
      ))}
    </>
  );
}

export default function FootprintsHome({
  variant = "home",
  footprintPicker = false,
  inverted = false,
  controls,
  children,
}: {
  // "home": full chrome (nav + colour rail + footprint picker).
  // "ambient": bare frosted-footprint canvas, no chrome — used as a background
  //            layer (e.g. the hero backdrop and behind the one-pager footer).
  variant?: "home" | "ambient";
  // "ambient" only: render the 5-animal picker (which critter's prints appear).
  footprintPicker?: boolean;
  // "ambient" only: flip to inverted polarity (dark panel, paper prints/text).
  inverted?: boolean;
  // "ambient" + footprintPicker only: extra controls rendered inline to the
  // right of the footprint picker, sharing its bottom-right corner cluster
  // (the footer passes its colour + light/dark bat here).
  controls?: ReactNode;
  children?: ReactNode;
} = {}) {
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const quietBoxes = useRef<
    { left: number; top: number; right: number; bottom: number }[]
  >([]);
  const paws = useRef<HTMLDivElement[]>([]);
  const pawI = useRef(0);
  const wipes = useRef<Wipe[]>([]);
  const dims = useRef({ w: 0, h: 0 });
  const lastStep = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastWipe = useRef<{ x: number; y: number } | null>(null);
  const side = useRef(1);
  const reduced = useRef(false);

  const [sel, setSel] = useState<Animal>("lion");
  const [hovered, setHovered] = useState<string | null>(null);
  // Ambient footprint picker: a fixed trigger showing the chosen animal; click
  // fans the rest upward, choosing one collapses back to the same spot.
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const selRef = useRef<Animal>("lion");
  const select = (a: Animal) => {
    setSel(a);
    selRef.current = a;
    setPickerOpen(false);
  };

  // Close the picker on an outside click or Escape.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown: EventListener = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPickerOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  // Two-tone palette, derived live from the chosen pastel + polarity. The canvas
  // (frost + prints) reads palRef every frame so it repaints the instant either
  // the color swatch or the light/dark toggle changes.
  //   light: paper = hue, ink = charcoal     dark: paper = charcoal, ink = hue
  const { resolvedTheme, color, setColor } = useTheme();
  const hue = PAPER_COLORS[color];
  const isDark = resolvedTheme === "dark";
  const paper = isDark ? CHARCOAL : hue;
  const ink = isDark ? hue : CHARCOAL;
  // The ambient layer can run at the OPPOSITE polarity — dark frost + paper
  // prints on a light page, and the reverse in dark mode — when asked (the
  // one-pager footer). The hero backdrop keeps the page's own polarity.
  const invert = variant === "ambient" && inverted;
  const bg = invert ? ink : paper;
  const fg = invert ? paper : ink;
  const pal: Palette = {
    bg,
    fog: `rgba(${rgbTriplet(bg)}, 0.72)`,
    ink: fg,
    pickerActive: `rgba(${rgbTriplet(fg)}, 0.12)`,
  };
  const palRef = useRef(pal);
  useEffect(() => {
    palRef.current = pal;
  }, [pal]);

  // Splash coordination: hold the home hidden until the splash lifts (or reveal
  // immediately when there's no splash, e.g. arriving via client-side nav), and
  // wait for the display font so the blur→sharp reveal doesn't reflow.
  const shouldReduce = useReducedMotion();
  const [lifted, setLifted] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const revealed = lifted && fontsReady;

  useEffect(() => {
    if (isSplashLifted() || !splashWillPlay()) {
      setLifted(true);
      return;
    }
    const off = onSplashLift(() => setLifted(true));
    const safety = window.setTimeout(() => setLifted(true), 2600); // never strand the home
    return () => {
      off();
      window.clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    let ok = true;
    const done = () => ok && setFontsReady(true);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(done);
    }
    const fb = window.setTimeout(done, 1500); // fallback if fonts never resolve
    return () => {
      ok = false;
      window.clearTimeout(fb);
    };
  }, []);

  // Reveal variants — links rise + sharpen from a soft blur, staggered.
  const revealDur = shouldReduce ? 0 : 0.8;
  const linkStack: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.1,
        delayChildren: shouldReduce ? 0 : 0.04,
      },
    },
  };
  const linkReveal: Variants = {
    hidden: { opacity: 0, y: 26, filter: "blur(12px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: revealDur, ease: REVEAL_EASE },
    },
  };

  // 0 over any protected element (calm) → 1 out in the open.
  const quietFactor = (x: number, y: number) => {
    let m = 1;
    for (const b of quietBoxes.current) {
      m = Math.min(m, clamp(rectDist(x, y, b) / QUIET_FADE, 0, 1));
    }
    return m;
  };

  const spawnPrint = (
    animal: Animal,
    x: number,
    y: number,
    rot: number,
    p: number,
    fade = 1,
  ) => {
    if (fade <= 0.06) return; // inside the quiet zone — no print
    const el = paws.current[pawI.current++ % POOL];
    if (!el) return;
    el.querySelectorAll<SVGElement>("[data-shape]").forEach((s) => {
      s.style.display = s.getAttribute("data-shape") === animal ? "block" : "none";
    });
    el.style.color = palRef.current.ink;
    el.style.filter = "blur(0.4px)";

    const opacity = lerp(0.5, 0.97, p) * fade;
    const scale = lerp(0.82, 1.2, p) * SIZE[animal] * lerp(0.72, 1, fade);
    gsap.killTweensOf(el);
    gsap.set(el, { x, y, rotation: rot, scale: scale * 0.78, opacity: 0 });
    gsap.to(el, { opacity, scale, duration: 0.18, ease: "power2.out" });
    gsap.to(el, {
      opacity: 0,
      duration: lerp(1.4, 2.4, p),
      ease: "power1.in",
      delay: 0.5 + p * 0.4,
    });
  };

  const addWipe = (x: number, y: number, r = WIPE_R, s = 1) => {
    wipes.current.push({ x, y, s, r });
    if (wipes.current.length > 80) wipes.current.shift();
  };

  const coords = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced.current) return;
    const { x, y } = coords(e);
    const q = quietFactor(x, y); // 0 over the menu → 1 out in the open

    // Clear a frost trail so the prints show through (faded near the menu).
    if (q > 0.08) {
      const lw = lastWipe.current;
      if (!lw || Math.hypot(x - lw.x, y - lw.y) > WIPE_MIN) {
        addWipe(x, y, WIPE_R, q);
        lastWipe.current = { x, y };
      }
    }

    // Lay a footprint every stride of travel; speed → pressure.
    const prev = lastStep.current;
    const now = performance.now();
    if (!prev) {
      lastStep.current = { x, y, t: now };
      return;
    }
    const dx = x - prev.x;
    const dy = y - prev.y;
    const dist = Math.hypot(dx, dy);
    const animal = selRef.current;
    if (dist < STRIDE[animal]) return;
    const speed = dist / Math.max(now - prev.t, 1);
    const p = clamp(1 - speed / SPEED_MAX, 0.18, 1);
    const ang = Math.atan2(dy, dx);
    const perp = ang + Math.PI / 2;
    spawnPrint(
      animal,
      x + Math.cos(perp) * FOOTW[animal] * side.current,
      y + Math.sin(perp) * FOOTW[animal] * side.current,
      (ang * 180) / Math.PI + 90,
      p,
      q,
    );
    side.current *= -1;
    lastStep.current = { x, y, t: now };
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced.current) return;
    const { x, y } = coords(e);
    const q = quietFactor(x, y);
    spawnPrint(selRef.current, x, y, rand(-15, 15), 1, q); // deliberate stomp
    if (q > 0.08) addWipe(x, y, WIPE_R * 1.6, q);
  };

  const onLeave = () => {
    lastStep.current = null;
    lastWipe.current = null;
  };

  // The body scroll-lock for the single-screen home is owned by SiteFrame,
  // route-aware, so it can never leak onto inner pages (see SiteFrame).

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // Grayscale noise tile → repeating pattern for the frost's grain.
    const noise = document.createElement("canvas");
    noise.width = noise.height = 160;
    const nctx = noise.getContext("2d")!;
    const img = nctx.createImageData(noise.width, noise.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nctx.putImageData(img, 0, 0);
    const grain = ctx.createPattern(noise, "repeat")!;

    const sizeCanvas = () => {
      const el = root.current!;
      const w = el.clientWidth;
      const h = el.clientHeight;
      dims.current = { w, h };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const computeQuietBoxes = () => {
      const rt = root.current;
      if (!rt) return;
      const o = rt.getBoundingClientRect();
      const els = [
        stackRef.current,
        bottomRef.current,
        railRef.current,
        // Ambient callers (e.g. the footer) mark their text with [data-quiet]
        // so prints fade around it and it stays readable + clickable.
        ...Array.from(rt.querySelectorAll<HTMLElement>("[data-quiet]")),
      ];
      quietBoxes.current = els.flatMap((el) => {
        if (!el) return [];
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.right) / 2 - o.left;
        const cy = (r.top + r.bottom) / 2 - o.top;
        const hw = Math.max(r.width / 2 + QUIET_PAD, QUIET_MIN_HW);
        const hh = Math.max(r.height / 2 + QUIET_PAD, QUIET_MIN_HH);
        return [
          { left: cx - hw, top: cy - hh, right: cx + hw, bottom: cy + hh },
        ];
      });
    };
    const onResize = () => {
      sizeCanvas();
      computeQuietBoxes();
    };
    sizeCanvas();
    computeQuietBoxes();
    if (document.fonts) document.fonts.ready.then(computeQuietBoxes);
    window.addEventListener("resize", onResize);

    const paintFog = (dt: number) => {
      const { w, h } = dims.current;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = palRef.current.fog;
      ctx.fillRect(0, 0, w, h);
      // Speckle the frost — jittered each frame for a live, glassy shimmer.
      ctx.save();
      ctx.globalAlpha = GRAIN;
      ctx.translate(-(Math.random() * 60), -(Math.random() * 60));
      ctx.fillStyle = grain;
      ctx.fillRect(0, 0, w + 60, h + 60);
      ctx.restore();
      ctx.globalCompositeOperation = "destination-out";
      wipes.current = wipes.current.filter((wp) => {
        wp.s -= dt / REFOG_MS;
        if (wp.s <= 0) return false;
        const g = ctx.createRadialGradient(wp.x, wp.y, 0, wp.x, wp.y, wp.r);
        g.addColorStop(0, `rgba(0,0,0,${wp.s})`);
        g.addColorStop(0.65, `rgba(0,0,0,${wp.s * 0.85})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, wp.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalCompositeOperation = "source-over";
    };

    if (reduced.current) {
      const { w, h } = dims.current;
      for (let i = 0; i < 5; i++) {
        const el = paws.current[i];
        if (!el) continue;
        const a = ANIMALS[i % ANIMALS.length];
        el.querySelectorAll<SVGElement>("[data-shape]").forEach((s) => {
          s.style.display = s.getAttribute("data-shape") === a ? "block" : "none";
        });
        el.style.color = palRef.current.ink;
        gsap.set(el, {
          x: w * (0.2 + i * 0.14),
          y: h * 0.7,
          rotation: i % 2 ? 8 : -8,
          scale: SIZE[a],
          opacity: 0.85,
        });
      }
      window.removeEventListener("resize", onResize);
      return;
    }

    const update = (_t: number, deltaMs: number) => paintFog(Math.min(deltaMs, 50));
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(paws.current);
      wipes.current = [];
    };
  }, []);

  // The inviting footprint trail plays once the home is revealed — so it isn't
  // wasted behind the splash.
  useEffect(() => {
    if (!revealed || reduced.current) return;
    const { w, h } = dims.current;
    const calls = Array.from({ length: 4 }, (_, i) =>
      gsap.delayedCall(0.25 + i * 0.18, () => {
        const x = w * (0.16 + i * 0.1);
        const y = h * (0.85 - i * 0.02);
        spawnPrint("lion", x, y, i % 2 ? 14 : -14, 0.7);
        addWipe(x, y);
      }),
    );
    return () => calls.forEach((c) => c.kill());
  }, [revealed]);

  return (
    <div
      ref={root}
      aria-label="Home"
      onPointerMove={onMove}
      onPointerDown={onDown}
      onPointerLeave={onLeave}
      className="absolute inset-0 z-0 flex flex-col"
      style={{
        backgroundColor: pal.bg,
        color: pal.ink,
        transition: "background-color 0.6s ease, color 0.6s ease",
      }}
    >
      {/* Footprints — under the frosted glass */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {Array.from({ length: POOL }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) paws.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <PawShapes />
          </div>
        ))}
      </div>

      {/* Frosted-glass veil — your cursor clears it; it slowly re-fogs */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
      />

      {/* Ambient variant: bare frosted-footprint layer with caller-supplied
          content above the frost. The wrapper stays pointer-events-none so the
          cursor still lays prints in the gaps; interactive children opt back in
          with pointer-events-auto. */}
      {variant === "ambient" && (
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{ color: pal.ink }}
        >
          {children}
        </div>
      )}

      {/* Ambient footprint picker — a fixed trigger showing the chosen animal;
          click fans the rest upward, choosing collapses it back to the same
          spot. data-quiet keeps prints from spawning over it. Anchored bottom-
          LEFT so the footer bottom reads as a balanced bar: picker (left) ·
          colophon (center) · colour + bat (right), all on one h-9 baseline. */}
      {variant === "ambient" && footprintPicker && (
        <div
          data-quiet
          className="pointer-events-auto absolute bottom-8 left-5 z-30 flex h-9 items-center sm:left-8"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
        >
          <div ref={pickerRef} className="relative flex h-6 items-center">
            {/* the other animals — fan upward from the fixed trigger on click */}
            <div
              className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-all duration-200"
              style={{
                opacity: pickerOpen ? 1 : 0,
                pointerEvents: pickerOpen ? "auto" : "none",
                transform: pickerOpen ? "translate(-50%, 0)" : "translate(-50%, 6px)",
              }}
            >
              {ANIMALS.filter((a) => a !== sel).map((a) => (
                <button
                  key={a}
                  onClick={() => select(a)}
                  aria-label={`${a} footprints`}
                  tabIndex={pickerOpen ? 0 : -1}
                  data-cursor-label={a[0].toUpperCase() + a.slice(1)}
                  className="flex h-6 w-6 items-center justify-center rounded-full transition-transform hover:scale-110"
                >
                  <svg viewBox="0 0 100 110" width="16" height="17" fill={pal.ink} style={{ opacity: 0.75 }}>
                    {shapeChildren(a)}
                  </svg>
                </button>
              ))}
            </div>

            {/* trigger — the current animal, in a fixed position */}
            <button
              onClick={() => setPickerOpen((o) => !o)}
              aria-label="Choose footprints"
              aria-expanded={pickerOpen}
              data-cursor-label={sel[0].toUpperCase() + sel.slice(1)}
              className="flex h-6 w-6 items-center justify-center rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: pal.pickerActive, boxShadow: `inset 0 0 0 2px ${pal.ink}` }}
            >
              <svg viewBox="0 0 100 110" width="16" height="17" fill={pal.ink}>
                {shapeChildren(sel)}
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Colour + light/dark bat — their own cluster in the bottom-right corner,
          balancing the footprint picker on the left. FooterControls carries its
          own h-9 + stopPropagation, so this wrapper only owns the corner spot. */}
      {variant === "ambient" && footprintPicker && controls && (
        <div className="pointer-events-auto absolute bottom-8 right-5 z-30 flex h-9 items-center sm:right-8">
          {controls}
        </div>
      )}

      {/* Home chrome — nav, colour rail, footprint picker. Only the full "home"
          variant renders it; the "ambient" variant stays chrome-free. */}
      {variant === "home" && (
        <>
      {/* Big links — idle: all sharp. Hover one: it stays clear, the rest frost. */}
      <nav
        aria-label="Sections"
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      >
        <motion.div
          ref={stackRef}
          variants={linkStack}
          initial="hidden"
          animate={revealed ? "show" : "hidden"}
          className="pointer-events-auto flex flex-col items-center gap-[clamp(0.5rem,min(2.6vw,2.6vh),2.25rem)]"
          onMouseLeave={() => setHovered(null)}
        >
          {LINKS.map((l) => {
            const frost = hovered !== null && hovered !== l.href;
            return (
              <motion.div key={l.href} variants={linkReveal}>
                <Link
                  href={l.href}
                  onMouseEnter={() => setHovered(l.href)}
                  data-cursor-label={l.cursor}
                  className="block lowercase"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontStyle: "italic",
                    // cap by width AND height so the no-scroll home never clips
                    // the stack on short / landscape phones
                    fontSize: "clamp(2.25rem, min(11vw, 15vh), 7.875rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                    color: pal.ink,
                    opacity: frost ? 0.4 : 1,
                    filter: frost ? "blur(7px)" : "blur(0px)",
                    transition: "filter 0.3s ease, opacity 0.3s ease",
                  }}
                >
                  {l.label}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </nav>

      {/* Color rail — the five papers. Picking one sets the background (and, in
          dark mode, the ink). Each swatch shows its true pastel so the choice
          reads the same in either polarity. */}
      <div
        ref={railRef}
        className="absolute left-2 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2.5 sm:left-6 sm:gap-3"
        style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.7s ease 0.2s" }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
      >
        {PAPER_ORDER.map((c) => {
          const active = color === c;
          return (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`${c} background`}
              aria-pressed={active}
              data-cursor-label={c === "blush" ? "Salmon" : c[0].toUpperCase() + c.slice(1)}
              className="grid h-6 w-6 place-items-center rounded-full transition-transform hover:scale-110 sm:h-7 sm:w-7"
              style={{
                boxShadow: active ? `0 0 0 1.5px ${pal.ink}, 0 0 0 4px ${pal.bg}` : "none",
              }}
            >
              <span
                className="block h-[15px] w-[15px] rounded-full sm:h-[18px] sm:w-[18px]"
                style={{
                  backgroundColor: PAPER_COLORS[c],
                  boxShadow: `inset 0 0 0 1px rgba(${rgbTriplet(pal.ink)}, 0.25)`,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom — footprint picker + tagline */}
      <div
        ref={bottomRef}
        className="relative z-30 mt-auto flex shrink-0 flex-col items-center gap-4 pb-8 pt-4"
        style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.7s ease 0.15s" }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {ANIMALS.map((a) => {
            const active = sel === a;
            return (
              <button
                key={a}
                onClick={() => select(a)}
                aria-label={`${a} footprints`}
                aria-pressed={active}
                data-cursor-label={a[0].toUpperCase() + a.slice(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity sm:h-11 sm:w-11"
                style={
                  active
                    ? { backgroundColor: pal.pickerActive, boxShadow: `inset 0 0 0 2px ${pal.ink}` }
                    : { opacity: 0.45 }
                }
              >
                <svg viewBox="0 0 100 110" width="26" height="28" fill={pal.ink}>
                  {shapeChildren(a)}
                </svg>
              </button>
            );
          })}
        </div>
        <p
          className="text-sm italic opacity-60"
          style={{ fontFamily: "var(--font-eb-garamond)" }}
        >
          Who doesn&rsquo;t love leaving a footprint!
        </p>
      </div>
        </>
      )}
    </div>
  );
}
