"use client";
/* eslint-disable @next/next/no-img-element -- case-study photos are tiny optimized JPGs, not gallery photos */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { gsap, useGSAP, SplitText } from "../lib/gsap";

/**
 * Feeld case study.
 *
 * Layout: editorial column (max-w-6xl), left-aligned text by default with
 * select centered moments. Pull / Body / Aside reveal word-by-word on scroll
 * via SplitText + ScrollTrigger. Key accent moments use the brand coral.
 * The "the app" section uses a pinned scroll reel — the phone frame stays
 * fixed in the viewport and the screen content (image + label + scribble)
 * cross-fades as you scroll.
 *
 * Sections in order:
 *  1 overview            (heading, meta table, hero, value statement)
 *  2 figbuild 2026       (origin, cycling-word kinetic line, particle aura)
 *  3 what we made        (bulleted signals, feeld image w/ Rock Salt overlay)
 *  4 the app             (pinned screens reel, 7 phone screens with scribbles)
 *  5 the hard part
 *  6 privacy             (concentric-ring layer diagram, hover-linked)
 *  7 reflection          (short close, brand sign-off line)
 *
 * Accent is Feeld's coral. All images live in /public/feeld/.
 * No em-dashes in body copy (standing rule).
 */

const ACCENT_LIGHT = "#CF4B3B";
const ACCENT_DARK = "#F08C7E";

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "origin", label: "figbuild 2026" },
  { id: "made", label: "what we made" },
  { id: "app", label: "the app" },
  { id: "hard", label: "the hard part" },
  { id: "privacy", label: "privacy" },
  { id: "reflection", label: "reflection" },
] as const;

const META = [
  { label: "Timeline", value: "12 hours · FigBuild 2026" },
  { label: "Team", value: "Shruthi, Hyebin, Reet, Amulya" },
  { label: "Form", value: "Contact lens + wristband" },
  { label: "Tools", value: "Figma Make · Figma Slides · Claude" },
];

// Seven app screens in narrative order: self → others → who affects you →
// patterns → reflect → reflect (open) → settings. File names mirror the
// /Fleed_images source names.
//
// `scribble` is the Rock Salt handwritten annotation. `scribblePos` is the
// Tailwind anchor on the phone surface — corners rotate across screens so
// the rhythm shifts as the reel advances. Widths kept tight (~max-w-[42%])
// so the scribbles read as marginalia, not headings.
const APP_SCREENS = [
  {
    name: "Aura",
    desc: "Your own signal, live. Five dimensions, one breathing particle field.",
    src: "/feeld/home.jpg",
    scribble: "the signal you give off",
    scribblePos: "top-6 right-4 max-w-[42%] text-right",
  },
  {
    name: "People",
    desc: "Your network. Each person's aura, their dominant dimension, what they're carrying today.",
    src: "/feeld/friends.jpg",
    scribble: "everyone, soft",
    scribblePos: "top-6 left-4 max-w-[42%] text-left",
  },
  {
    name: "Who shifts you",
    desc: "Which specific people raise or lower your signal, and by how much.",
    src: "/feeld/who-shifts.jpg",
    scribble: "they change your weather",
    scribblePos: "bottom-8 left-4 right-4 text-center",
  },
  {
    name: "Patterns",
    desc: "Your energy over time. Which days are lowest. What specific people do to your score.",
    src: "/feeld/patterns.jpg",
    scribble: "where you dim",
    scribblePos: "top-6 right-4 max-w-[42%] text-right",
  },
  {
    name: "Reflect",
    desc: "Completely private. A timeline of your own signal. Nobody else sees this.",
    src: "/feeld/reflect.jpg",
    scribble: "only you can see this",
    scribblePos: "bottom-8 left-4 right-4 text-center",
  },
  {
    name: "Reflect, open",
    desc: "The same day, opened up: charts, notes, the shape your aura made.",
    src: "/feeld/reflect-2.jpg",
    scribble: "today, opened up",
    scribblePos: "bottom-8 right-4 max-w-[48%] text-right",
  },
  {
    name: "Settings",
    desc: "Vocabulary level, privacy layers, sensor connection.",
    src: "/feeld/settings.jpg",
    scribble: "your rules",
    scribblePos: "bottom-8 left-4 max-w-[42%] text-left",
  },
];

// ---------------------------------------------------------------- helpers

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Section eyebrow + squiggle. Default alignment is left to match the editorial
 * pattern used in Temple/Onki/Kodif/Zuge/HandmadeHomestead; pass align="center"
 * to override for the centered moments (app + privacy sections).
 */
function Label({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  const isCenter = align === "center";
  return (
    <div className={isCenter ? "text-center" : "text-left"}>
      <p
        className="font-mono text-caption-1 uppercase tracking-wide"
        style={{ color: "var(--accent)" }}
      >
        {children}
      </p>
    </div>
  );
}

/** Inline accent highlight — used for the key word/name in a sentence. */
function Em({ children }: { children: React.ReactNode }) {
  return (
    <em
      className="not-italic font-medium"
      style={{ color: "var(--accent)" }}
    >
      {children}
    </em>
  );
}

// ---- scroll-reveal: words fade + lift in as the line enters the viewport ----

function useWordReveal(
  ref: React.RefObject<HTMLElement | null>,
  opts: { stagger?: number; y?: number; start?: string } = {},
) {
  const { stagger = 0.04, y = 18, start = "top 82%" } = opts;
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReduced()) return;
      const split = new SplitText(el, { type: "words" });
      gsap.set(split.words, { opacity: 0, y, willChange: "transform, opacity" });
      gsap.to(split.words, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        stagger,
        scrollTrigger: { trigger: el, start, toggleActions: "play none none reverse" },
      });
      return () => split.revert();
    },
    { scope: ref },
  );
}

// Per-section statement (declarative). One step below the page-h1.
// Default align="left" with a max-w-[30ch] reading column so the headline
// breaks naturally to 2-3 lines (matches Temple/Onki/Kodif/Zuge).
// align="center" lifts the constraint and centers — used for the kinetic
// moments listed as exceptions (the "Through the lens..." Pull, the app
// section, the privacy section intro).
function Pull({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useWordReveal(ref, { stagger: 0.045, y: 22 });
  // Left variant spans the full Section column (no max-w cap) so headings
  // use the whole horizontal space instead of pinching to a narrow rail.
  const widthAlign = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <p
      ref={ref}
      className={`font-heading leading-[1.14] text-text text-h3 ${widthAlign} ${className}`}
      style={{ letterSpacing: "-0.01em" }}
    >
      {children}
    </p>
  );
}

// Body paragraph — token-sized (text-paragraph). Word-revealed.
// Default left at max-w-[60ch] for a comfortable reading rail. Center variant
// caps at max-w-3xl so centered paragraphs don't sprawl across the section.
function Body({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useWordReveal(ref, { stagger: 0.018, y: 14 });
  // Left variant spans the full Section column; center variant caps so a
  // centered paragraph doesn't sprawl edge-to-edge.
  const widthAlign =
    align === "center" ? "mx-auto text-center max-w-3xl" : "text-left";
  return (
    <p
      ref={ref}
      className={`font-body leading-relaxed text-muted text-paragraph ${widthAlign} ${className}`}
    >
      {children}
    </p>
  );
}

// ---- Figure: image w/ subtle scroll-parallax and an aspect frame ----

function Figure({
  src,
  alt,
  label,
  file,
  aspect = "aspect-[16/9]",
  position = "center",
  cursorLabel,
  className = "",
  // Default OFF per her ask: no scroll effects on images. Images sit still
  // in their frames. Opt-in by passing `parallax` if a specific Figure needs
  // the subtle scroll-driven shift.
  parallax = false,
}: {
  src?: string;
  alt?: string;
  label: string;
  file: string;
  aspect?: string;
  position?: string;
  cursorLabel?: string;
  className?: string;
  parallax?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const showImage = !!src && !errored;
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (!showImage || !parallax || prefersReduced()) return;
      const img = imgRef.current;
      if (!img) return;
      gsap.fromTo(
        img,
        { yPercent: -6, scale: 1.12 },
        {
          yPercent: 6,
          scale: 1.12,
          ease: "none",
          scrollTrigger: {
            trigger: frameRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { dependencies: [showImage, parallax], scope: frameRef },
  );

  if (showImage) {
    return (
      <div
        ref={frameRef}
        className={`relative w-full overflow-hidden ${aspect} ${className}`}
        data-cursor-label={cursorLabel}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? label}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
          onError={() => setErrored(true)}
        />
      </div>
    );
  }

  // Fallback: dashed placeholder if the image fails to load.
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed bg-surface/50 px-4 ${aspect} ${className}`}
      style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
      aria-label={label}
      data-cursor-label={cursorLabel}
    >
      <span
        className="max-w-[85%] text-center font-mono text-caption-1 uppercase tracking-wide"
        style={{ color: "color-mix(in srgb, var(--accent) 75%, var(--color-muted))" }}
      >
        {label}
      </span>
      <span className="font-mono text-caption-2 lowercase tracking-wide text-muted/70">{file}</span>
    </div>
  );
}

/**
 * Rock Salt handwritten line — used for the overlay on the feeld image and
 * the scribbles inside the screens reel. Reveals word-by-word on scroll
 * entry (one-shot, no scrub) so it appears as if jotted in. Stays static
 * after that. Soft text-shadow keeps it legible on busy photo backgrounds.
 *
 * `size="overlay"` is the larger annotation-on-image variant (~14-18px).
 * `size="scribble"` is the smaller phone-screen variant (~11-14px).
 */
function RockSaltLine({
  children,
  className = "",
  size = "scribble",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "overlay" | "scribble";
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useWordReveal(ref, { stagger: 0.05, y: 8 });
  const fontSize =
    size === "overlay"
      ? "clamp(0.9rem, 1.2vw, 1.15rem)"
      : "clamp(0.72rem, 0.95vw, 0.9rem)";
  return (
    <p
      ref={ref}
      className={`leading-snug text-white ${className}`}
      style={{
        fontFamily: "var(--font-rocksalt)",
        fontSize,
        textShadow:
          "0 1px 0 rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </p>
  );
}

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity: 0.05,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

// ---------------------------------------------------------------- aura particles
// Canvas orbit-field: five named dimensions, each a colour, with breathing
// radial glows and drifting motes. Used in the origin section as a visual
// stand-in for the lens's POV. Pauses on prefers-reduced-motion, and pauses
// when off-screen via IntersectionObserver so it doesn't burn frames on
// long pages.

const AURA_DIMS = {
  VITAL:   { color: "#E8854A", label: "Vital",   speed: 1.8, radius: 72, opacity: 0.9,  val: 72 },
  OPEN:    { color: "#5BA8C4", label: "Open",    speed: 0.9, radius: 58, opacity: 0.7,  val: 58 },
  CHARGED: { color: "#C4627A", label: "Charged", speed: 2.2, radius: 80, opacity: 0.95, val: 81 },
  SETTLED: { color: "#7AB87A", label: "Settled", speed: 0.5, radius: 50, opacity: 0.6,  val: 44 },
  CLEAR:   { color: "#A882D4", label: "Clear",   speed: 1.2, radius: 64, opacity: 0.8,  val: 67 },
} as const;
type AuraKey = keyof typeof AURA_DIMS;
const AURA_KEYS = Object.keys(AURA_DIMS) as AuraKey[];

// Sizing constants for the particle canvas. AURA_SIZE controls the canvas
// (and the particle field radius) — bigger value = more breathing room for
// the orbiting motes. AURA_SCALE keeps the original tuning proportional so
// particle dot size, wobble amplitude, and label-ring positions all expand
// with the canvas. AURA_SPEED is a global slow-down factor applied to time
// progression and per-particle drift (1.0 = original tuning; 0.5 = half).
const AURA_SIZE = 640;
const AURA_SCALE = AURA_SIZE / 320;
const AURA_SPEED = 0.5;

function AuraParticles() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const SIZE = AURA_SIZE;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Internal pixel resolution stays at AURA_SIZE × dpr so the canvas always
    // renders at full crispness; the displayed size is constrained to the
    // parent (max AURA_SIZE on desktop, fills container on smaller screens)
    // and the canvas scales down via CSS while keeping the square aspect.
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Particle field, sized per-dimension's `val`. Radii + particle dot size
    // multiplied by AURA_SCALE so the field expands with the canvas.
    const pts = AURA_KEYS.flatMap((k) => {
      const d = AURA_DIMS[k];
      const v = d.val / 100;
      const count = Math.floor(30 + v * 60);
      const baseR = d.radius * AURA_SCALE;
      return Array.from({ length: count }, () => ({
        color: d.color,
        angle: Math.random() * Math.PI * 2,
        radius: (baseR * 0.4 + Math.random() * baseR * 0.6) * (0.6 + v * 0.4),
        drift: (Math.random() - 0.5) * 0.007 * AURA_SPEED * d.speed * (0.5 + v * 0.8),
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: (Math.random() - 0.5) * 0.025 * AURA_SPEED,
        wobbleAmp: Math.random() * 5 * AURA_SCALE * v,
        sz: (0.6 + Math.random() * 2 * v) * AURA_SCALE,
        op: (0.25 + Math.random() * 0.75) * d.opacity * (0.4 + v * 0.6),
      }));
    });

    const reduced = prefersReduced();
    let t = 0;
    let raf = 0;
    let playing = true;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      t += reduced ? 0 : 0.012 * AURA_SPEED;

      // Soft per-dimension glow centred on the canvas
      AURA_KEYS.forEach((k) => {
        const d = AURA_DIMS[k];
        const v = d.val / 100;
        const glowR = d.radius * AURA_SCALE * 0.8;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        const stop = Math.round(v * 22).toString(16).padStart(2, "0");
        grd.addColorStop(0, d.color + stop);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();
      });

      // Orbiting motes
      pts.forEach((p) => {
        if (!reduced) {
          p.angle += p.drift;
          p.wobble += p.wobbleSpeed;
        }
        const r = p.radius + Math.sin(p.wobble) * p.wobbleAmp;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r * 0.88;
        const pulse = 0.65 + 0.35 * Math.sin(t * 1.8 + p.wobble);
        ctx.globalAlpha = p.op * pulse;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.sz, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (playing) raf = requestAnimationFrame(draw);
    }

    // Pause when off-screen so we don't burn frames as the user reads elsewhere.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !playing) {
            playing = true;
            raf = requestAnimationFrame(draw);
          } else if (!entry.isIntersecting && playing) {
            playing = false;
            cancelAnimationFrame(raf);
          }
        });
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    raf = requestAnimationFrame(draw);
    return () => {
      playing = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full"
      style={{ maxWidth: AURA_SIZE, aspectRatio: "1 / 1" }}
      aria-label="Five-dimension aura: a breathing field of orbiting particles in five colours"
      data-cursor-label="this is how we visualised Aura of a human."
    >
      <canvas ref={canvasRef} className="block" />
      {/* Labels arranged radially around the canvas. Positions are PERCENT
         of the wrapper so labels follow the canvas when it scales down on
         smaller viewports, instead of staying pinned to AURA_SIZE pixels
         and drifting off the canvas. */}
      {AURA_KEYS.map((k, i) => {
        const d = AURA_DIMS[k];
        const angle = (i / AURA_KEYS.length) * Math.PI * 2 - Math.PI / 2;
        const xPct = 50 + Math.cos(angle) * 47;
        const yPct = 50 + Math.sin(angle) * 47;
        return (
          <div
            key={k}
            className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                color: d.color,
                opacity: 0.95,
                whiteSpace: "nowrap",
              }}
            >
              {d.label}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 11,
                fontWeight: 300,
                color: "color-mix(in srgb, var(--text) 38%, transparent)",
              }}
            >
              {d.val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- cycling word
// Used in the origin section. The host sentence keeps the bracket text fixed
// ("Few people call it ___?") and a single slot cycles through a list of
// words, sliding up to swap, and settles on the final word (Aura).

function CyclingWord({
  words,
  hold = 1.4,
  className = "",
}: {
  words: string[];
  hold?: number;
  className?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // The last word in the array is the "highlighted" one (accent colour); it
  // still cycles like the others, it just gets the brand colour when visible.
  const highlightIdx = words.length - 1;

  useGSAP(
    () => {
      const els = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
      if (!els.length) return;

      if (prefersReduced()) {
        // Just show the highlighted word, no motion.
        els.forEach((el, i) => gsap.set(el, { opacity: i === highlightIdx ? 1 : 0, y: 0 }));
        return;
      }

      const n = words.length;
      // Start with word 0 visible, others hidden below.
      els.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 18 }));

      // Infinite loop: hold current → slide out & in next, repeating through
      // the whole array. repeat:-1 on the timeline keeps it running forever
      // once the element scrolls into view.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 90%",
          toggleActions: "play pause resume pause",
        },
        repeat: -1,
      });

      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        tl.to({}, { duration: hold }) // visible-hold for the current word
          .to(els[i], { opacity: 0, y: -18, duration: 0.32, ease: "power2.in" })
          .fromTo(
            els[next],
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.36, ease: "power2.out" },
            "<",
          );
      }
    },
    { scope: root },
  );

  // Reserve space for the widest word by stacking an invisible spacer.
  // Inline styles (instead of Tailwind utilities) for the critical positioning
  // and initial opacity so the layout is correct from the very first paint —
  // before useGSAP mounts. Previously the absolute/sr-only utilities were
  // bleeding through during the initial frame and showing all words stacked.
  const widest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span
      ref={root}
      className={className}
      style={{ position: "relative", display: "inline-block", verticalAlign: "baseline" }}
    >
      {/* Invisible spacer reserves the width of the widest word so the
         surrounding sentence doesn't reflow as words swap. */}
      <span
        aria-hidden
        style={{ visibility: "hidden", whiteSpace: "nowrap", fontStyle: "italic" }}
      >
        {widest}
      </span>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          aria-hidden={i !== highlightIdx}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            whiteSpace: "nowrap",
            fontStyle: "italic",
            // Inline initial opacity so only the first word shows on first
            // paint; gsap takes over after mount.
            opacity: i === 0 ? 1 : 0,
            color: i === highlightIdx ? "var(--accent)" : undefined,
          }}
        >
          {w}
        </span>
      ))}
      {/* Screen-reader-only label — inline styles, never visible. */}
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {words[highlightIdx]}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------- privacy rings
// Concentric-aperture diagram of the four privacy layers. Reads like an iris,
// matches the lens metaphor. Reveal on scroll: rings draw in from the centre
// out, descriptions stagger in beside them.

const PRIVACY_LAYERS = [
  { name: "Private", desc: "Only you. Nothing leaves the lens.",                       r: 28 },
  { name: "Signal",  desc: "A single word, no numbers, no breakdown.",                  r: 64 },
  { name: "Close",   desc: "Friends you trust. The five dimensions, live.",             r: 104 },
  { name: "Open",    desc: "Anyone in the room, with your permission.",                 r: 144 },
];

function PrivacyRings() {
  const root = useRef<HTMLDivElement>(null);
  // Active layer index — set on hover of a ring OR its row, cleared on
  // leave. Bidirectional: hovering a ring lifts the linked row from muted
  // → full; hovering a row lifts the linked ring.
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReduced()) return;
      const rings = el.querySelectorAll<SVGCircleElement>("[data-ring]");
      const rows = el.querySelectorAll<HTMLLIElement>("[data-row]");
      gsap.set(rings, { opacity: 0, transformOrigin: "50% 50%", scale: 0.4 });
      gsap.set(rows, { opacity: 0, x: 18 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse" },
      });
      tl.to(rings, { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out", stagger: 0.08 })
        .to(rows, { opacity: 1, x: 0, duration: 0.45, ease: "power2.out", stagger: 0.08 }, "-=0.4");
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="mt-12 flex flex-col items-center gap-12 md:flex-row md:items-center md:justify-center md:gap-20"
    >
      <svg
        viewBox="0 0 320 320"
        className="w-full max-w-xs md:max-w-sm"
        aria-label="Four privacy layers: Private, Signal, Close, Open"
      >
        {/* Rings rendered outside-in so outer ones DOM-order under their
           hit zones. Each ring has two circles: a thin VISIBLE accent
           stroke + a thicker TRANSPARENT stroke on top that acts as the
           hover hit area (thin 1-2px strokes are hard to hover precisely).
           Active ring (or row) brightens to opacity 1 + bumped strokeWidth. */}
        {[...PRIVACY_LAYERS].reverse().map((l, idx) => {
          const i = PRIVACY_LAYERS.length - 1 - idx;
          const isActive = active === i;
          // Rings sit at a uniform 50% opacity by default; only the hovered
          // ring lifts to full. Stroke width also nudges up on hover for a
          // clearer "pick" affordance.
          const baseStroke = 1 + (PRIVACY_LAYERS.length - i) * 0.3;
          return (
            <g
              key={l.name}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((prev) => (prev === i ? null : prev))}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={`${l.name} privacy layer: ${l.desc}`}
            >
              {/* Visible stroke */}
              <circle
                data-ring
                cx="160"
                cy="160"
                r={l.r}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={isActive ? baseStroke + 1.4 : baseStroke}
                opacity={isActive ? 1 : 0.5}
                style={{ transition: "opacity 220ms ease, stroke-width 220ms ease" }}
              />
              {/* Wide transparent hit area so the stroke is comfortable to hover */}
              <circle
                cx="160"
                cy="160"
                r={l.r}
                fill="none"
                stroke="transparent"
                strokeWidth={18}
                pointerEvents="stroke"
              />
            </g>
          );
        })}
        <circle cx="160" cy="160" r="4" fill="var(--accent)" />
      </svg>

      <ol className="flex w-full max-w-md flex-col gap-5">
        {PRIVACY_LAYERS.map((l, i) => {
          const isActive = active === i;
          // Row sits at 50% opacity by default; lifts to full only when its
          // ring (or itself) is hovered. The name flips to accent colour
          // on hover for clear linkage.
          return (
            <li
              key={l.name}
              data-row
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((prev) => (prev === i ? null : prev))}
              className="group flex cursor-pointer items-baseline gap-4 transition-opacity"
              style={{ opacity: isActive ? 1 : 0.5 }}
            >
              <span
                className="font-mono text-caption-2 uppercase tracking-[0.14em]"
                style={{ color: "var(--accent)", minWidth: "1.4rem" }}
              >
                0{i + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span
                  className="font-heading text-h4 transition-colors"
                  style={{
                    fontWeight: 700,
                    color: isActive ? "var(--accent)" : "var(--text)",
                  }}
                >
                  {l.name}.
                </span>
                <span className="font-body text-body text-muted">{l.desc}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------- screens reel
// Pinned section: the frame is fixed, but on scroll the content changes.
// The phone frame stays in the viewport while the page scrolls; the screen
// image inside cross-fades through APP_SCREENS (7 entries), and the side
// label (name + description) advances in lockstep. The phone is sized to
// max-h-[92vh] at 60% of the row width; the label column gets the other 40%.

function ScreensReel() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReduced()) return;
      const screens = gsap.utils.toArray<HTMLElement>("[data-screen]", el);
      const labels = gsap.utils.toArray<HTMLElement>("[data-label]", el);
      const n = screens.length;
      if (!n) return;

      gsap.set(screens, { opacity: 0 });
      gsap.set(labels, { opacity: 0, y: 16 });
      gsap.set(screens[0], { opacity: 1 });
      gsap.set(labels[0], { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${(n - 1) * window.innerHeight}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Each scribble sits inside its screen container, so when the container
      // opacity cross-fades, the scribble visually fades with it. No per-
      // scribble animation needed here.
      for (let i = 1; i < n; i++) {
        const at = i - 1;
        tl.to(screens[i - 1], { opacity: 0, duration: 0.5 }, at)
          .to(screens[i], { opacity: 1, duration: 0.5 }, at)
          .to(labels[i - 1], { opacity: 0, y: -16, duration: 0.4 }, at)
          .fromTo(labels[i], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, at + 0.1);
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="The Feeld app screens"
      className="relative h-screen overflow-hidden"
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-6 px-6 sm:px-10 md:flex-row md:gap-12 lg:px-16">
        {/* Left: the changing label */}
        <div className="relative order-2 h-[28vh] w-full md:order-1 md:h-[80vh] md:w-2/5">
          {APP_SCREENS.map((s, i) => (
            <div
              key={s.name}
              data-label
              className="absolute inset-0 flex flex-col items-center justify-center text-center md:items-start md:text-left"
            >
              <span
                className="font-mono text-caption-1 lowercase tracking-[0.06em]"
                style={{ color: "var(--accent)" }}
              >
                0{i + 1} / 0{APP_SCREENS.length}
              </span>
              <h3
                className="mt-4 font-heading text-text text-h3"
                style={{ fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.02 }}
              >
                {s.name}.
              </h3>
              <p className="mt-3 max-w-[34ch] font-body leading-relaxed text-muted text-body">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Right: the phone frame, screens cross-fading inside it. Sized to
           max-h-[92vh] on desktop, takes 60% of the row width. */}
        <div className="order-1 flex h-[60vh] w-full items-center justify-center md:order-2 md:h-[92vh] md:w-3/5">
          <div className="relative aspect-[9/19] h-full max-h-[92vh] rounded-[2.5rem] bg-black p-[6px] shadow-2xl ring-1 ring-black/40">
            <div className="relative h-full w-full overflow-hidden rounded-[2.15rem] bg-black">
              {/* Each screen wrapped in a container so the image and its
                 Rock Salt scribble cross-fade together via the timeline's
                 container opacity. The scribble text itself just sits as
                 Rock Salt HTML — no separate per-scribble animation, no
                 stroke-draw, no scroll dependency. */}
              {APP_SCREENS.map((s) => (
                <div
                  key={s.name}
                  data-screen
                  className="absolute inset-0 h-full w-full"
                >
                  <img
                    src={s.src}
                    alt={s.name}
                    className="block h-full w-full object-cover"
                  />
                  {s.scribble && (
                    <div className={`pointer-events-none absolute ${s.scribblePos}`}>
                      <RockSaltLine size="scribble">{s.scribble}</RockSaltLine>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- chrome

function SectionRail({ active, onJump }: { active: string; onJump: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <nav
      aria-label="Sections"
      className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3.5 md:flex"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        const show = isActive || hovered === s.id;
        const size = isActive ? 9 : 6;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onJump(s.id)}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={s.label}
            aria-current={isActive ? "true" : undefined}
            data-cursor-label={s.label}
            className="group relative flex h-6 w-6 items-center justify-center"
          >
            <span
              aria-hidden
              style={{
                width: size,
                height: size,
                borderRadius: "9999px",
                backgroundColor: isActive ? "var(--accent)" : "var(--color-muted)",
                opacity: isActive ? 1 : show ? 0.85 : 0.4,
                transition: "all 0.2s ease-out",
              }}
            />
            <span
              className={`pointer-events-none absolute left-7 whitespace-nowrap rounded-md bg-surface px-2 py-0.5 font-mono text-caption-2 uppercase tracking-wide shadow-sm transition-all duration-200 ease-out ${
                show ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
              }`}
              style={{ color: isActive ? "var(--accent)" : "var(--text)" }}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function ProgressBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-muted/20 md:hidden">
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{ width: `${p}%`, backgroundColor: "var(--accent)" }}
      />
    </div>
  );
}

// Sentence-heavy sections use this wrapper. max-w-6xl matches the editorial
// column width used by Temple/Onki/Kodif/Zuge/HandmadeHomestead so the case
// studies share one rail. Vertical padding stays at py-14 / md:py-20.
function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-6 py-14 sm:px-10 md:py-20 lg:px-20 xl:px-24 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------- page

export function FeeldCaseStudy() {
  const [active, setActive] = useState<string>("overview");
  const { resolvedTheme } = useTheme();
  const accent = resolvedTheme === "dark" ? ACCENT_DARK : ACCENT_LIGHT;

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div
      className="relative"
      style={{ backgroundColor: "var(--bg)", ["--accent"]: accent } as React.CSSProperties}
    >
      <GrainOverlay />
      <SectionRail active={active} onJump={jump} />
      <ProgressBar />

      <div className="relative z-10">
        {/* 1 — OVERVIEW
           Left-aligned hero; the title leads (no eyebrow above it) so it
           matches the other case studies. */}
        <Section id="overview" className="pt-28 md:pt-32">
          <h1
            className="text-left font-display leading-[1.02] text-text text-h1"
            style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Sense the room.
          </h1>

          <p className="mt-5 text-left font-heading italic text-muted text-paragraph-2">
            A wearable that proves what you already sense.
          </p>

          <dl className="mt-12 grid grid-cols-1 gap-x-12 gap-y-5 border-y border-border py-7 sm:grid-cols-2 md:grid-cols-4">
            {META.map((m) => (
              <div key={m.label} className="text-left">
                <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">
                  {m.label}
                </dt>
                <dd className="mt-1 font-body text-body text-text">{m.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-14">
            <Figure
              src="/feeld/hero.jpg"
              file="feeld/hero.jpg"
              label="a gathering, the kind of room feeld is built to sense"
              aspect="aspect-[16/9]"
              cursorLabel="the room"
            />
          </div>

          {/* Value statement — the overview closer. */}
          <Pull className="mt-16">
            Most of what people carry stays invisible. <Em>Feeld</Em> makes it legible,
            so you can understand others better and meet them with empathy.
          </Pull>
        </Section>

        {/* 2 — ORIGIN (FigBuild 2026) */}
        <Section id="origin">
          <Label>FigBuild 2026 Challenge</Label>

          <Body className="mt-10">
            Figma&apos;s FigBuild 2026 challenge asked designers to build a speculative
            tool that tracks, measures, or visualizes a human sense that doesn&apos;t exist
            yet. The tool had to support a real wellness goal, address who it&apos;s for,
            and show how it works in everyday life.
          </Body>

          {/* Continuation of the paragraph above (same Figtree body voice,
             not a heading-level Pull). Em on the key phrase. */}
          <Body className="mt-10">
            Four of us, kept coming back to one question: what&apos;s{" "}
            <Em>the most invisible thing</Em> about people, but you just feel it?
          </Body>

          {/* Cycling line: "Few people call it ___?" cycles through
             vibe → feeling → Aura on an infinite loop. */}
          <p className="mt-10 text-left font-heading leading-relaxed text-muted text-h4">
            <em className="not-italic">Few people call it</em>{" "}
            <CyclingWord words={["a vibe", "a feeling", "Aura"]} />
            <em className="not-italic" style={{ marginLeft: 2 }}>?</em>
          </p>

          {/* Particle aura — a visual stand-in for the lens's POV. */}
          <div className="mt-16 flex justify-center">
            <AuraParticles />
          </div>
        </Section>

        {/* 3 — MADE */}
        <Section id="made">
          <Label>what we made</Label>

          <Pull className="mt-10">
            <Em>Feeld</Em> is a contact lens and wristband.
          </Pull>

          {/* Lists side-by-side on desktop (lens left, wristband right) so the
             two signal channels read as a pair; stack vertically on mobile. */}
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
            {/* lens signals */}
            <div>
              <p
                className="font-mono text-caption-2 uppercase tracking-[0.14em]"
                style={{ color: "var(--accent)" }}
              >
                The lens reads neurological signals
              </p>
              <ul className="mt-4 flex flex-col gap-2 font-body text-paragraph text-text">
                <li className="flex items-baseline gap-3">
                  <span style={{ color: "var(--accent)" }}>·</span> Pupil dilation
                </li>
                <li className="flex items-baseline gap-3">
                  <span style={{ color: "var(--accent)" }}>·</span> Blink patterns
                </li>
                <li className="flex items-baseline gap-3">
                  <span style={{ color: "var(--accent)" }}>·</span> Micro-saccades
                </li>
              </ul>
            </div>

            {/* wristband signals */}
            <div>
              <p
                className="font-mono text-caption-2 uppercase tracking-[0.14em]"
                style={{ color: "var(--accent)" }}
              >
                The wristband reads the body
              </p>
              <ul className="mt-4 flex flex-col gap-2 font-body text-paragraph text-text">
                <li className="flex items-baseline gap-3">
                  <span style={{ color: "var(--accent)" }}>·</span> Heart rate variability
                </li>
                <li className="flex items-baseline gap-3">
                  <span style={{ color: "var(--accent)" }}>·</span> Skin conductance
                </li>
                <li className="flex items-baseline gap-3">
                  <span style={{ color: "var(--accent)" }}>·</span> Temperature
                </li>
              </ul>
            </div>
          </div>

          <Body className="mt-12">
            Together they measure five dimensions of your state, live.{" "}
            <Em>Vital. Open. Charged. Settled. Clear.</Em>
          </Body>

          {/* feeld.png at the same width as the overview hero (constrained
             inside the Section, aspect 7/6 ≈ natural 2000/1728). The
             descriptive sentence is overlaid as Rock Salt text (HTML, not
             SVG) — word-by-word fade-in on scroll entry, then static. No
             stroke-draw, no scroll-scrub. */}
          <div className="relative mt-14">
            <Figure
              src="/feeld/feeld.jpg"
              file="feeld/feeld.jpg"
              label="Feeld: the lens HUD overlaid on a dinner scene"
              aspect="aspect-[7/6]"
              cursorLabel="the field"
            />
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center px-6 pb-6 md:px-12 md:pb-10">
              <RockSaltLine size="overlay" className="max-w-md text-center">
                Through the lens, every person around you has a soft colour glow
                and one word about their current mood.
              </RockSaltLine>
            </div>
          </div>

          {/* The four key words sit below the image, centered for emphasis. */}
          <Pull align="center" className="mt-16">
            <Em>Steady. Electric. Sharp. Open.</Em>
          </Pull>

          {/* "how you see" image — single person, anchored at the top of
             the source so the subject's face stays in frame. */}
          <div className="mt-12">
            <Figure
              src="/feeld/how-you-see.jpg"
              file="feeld/how-you-see.jpg"
              label="The lens POV: one person in the room with their soft aura glow"
              aspect="aspect-[7/5]"
              position="center top"
              cursorLabel="how you see"
            />
          </div>
        </Section>

        {/* 4 — APP (intro + pinned reel) */}
        <section id="app" className="scroll-mt-24">
          <Section className="pb-0">
            <Label>the app</Label>

            <Pull className="mt-10">
              <Em>Feeld</Em> has five screens. Each one does <Em>exactly one</Em> thing.
            </Pull>
          </Section>

          <ScreensReel />
        </section>

        {/* 5 — HARD */}
        <Section id="hard">
          <Label>the hard part</Label>

          <Body className="mt-10">
            Every early version was too loud. Labels, states, numbers, bars. We kept
            adding because we were nervous the concept wouldn&apos;t land without
            explanation. It never did.
          </Body>

          <Pull className="mt-16">
            The moment we stripped it back to one glow and one word, it{" "}
            <Em>clicked</Em>.
          </Pull>
        </Section>

        {/* 6 — PRIVACY
           Text reads left-aligned at section width; the rings diagram keeps
           its centered SVG+list layout (it's a visual, not prose). */}
        <Section id="privacy">
          <Label>privacy</Label>

          <Body className="mt-10">
            <Em>Feeld</Em> has four privacy layers. You control what you share, and
            with whom.
          </Body>

          <PrivacyRings />

          <Body className="mt-14">
            Go fully offline and you lose access to others&apos; signals too. Like
            WhatsApp read receipts. It works both ways.
          </Body>
        </Section>

        {/* 7 — REFLECTION */}
        <Section id="reflection">
          <Label>reflection</Label>

          <Body className="mt-10">
            Figma&apos;s challenge pushed us into territory none of us had designed in
            before. Speculative UX, emerging technology, senses that don&apos;t exist
            yet. It stretched the way I think about what design can even be.
          </Body>

          {/* Sign-off line — uppercased mono, matches the SectionRail and
             the other case studies' sign-offs. */}
          <p
            className="mt-20 text-left font-mono text-caption-1 uppercase tracking-wide"
            style={{ color: "var(--accent)" }}
          >
            Feeld. Sense the room.
          </p>
        </Section>
      </div>
    </div>
  );
}
