

"use client";

import { useEffect, useRef, useState } from "react";
import { Rock_Salt, Oswald, Lato, DynaPuff } from "next/font/google";
import { useTheme } from "./ThemeProvider";
import { gsap, useGSAP } from "../lib/gsap";

/**
 * Handmade Homestead case study.
 *
 * Layout follows an editorial single-column pattern (ref: emmiwu.com/figma):
 * a left section rail, a narrow ~65ch reading column for sparse, punchy copy,
 * and large full-width media (16:9 banners, 3-up square grids, vertical reel
 * slots). Section labels are lowercase; the page opens on a brief question and
 * closes on a poetic line. The brand still shows for real - the palette as
 * native swatches and the type in its actual faces (Oswald / Lato / DynaPuff).
 *
 * Photos fall back to a labelled placeholder until the file lands in
 * /public/handmade-homestead/, so the page is never broken mid-build.
 */

// Rock Salt - the handwriting (same as the About polaroids + asides).
const rockSalt = Rock_Salt({ weight: "400", subsets: ["latin"], display: "swap" });

// The brand's own typefaces, loaded so the type specimen is the real thing.
const oswald = Oswald({ subsets: ["latin"], display: "swap" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });
const dynaPuff = DynaPuff({ subsets: ["latin"], display: "swap" });

// ---------------------------------------------------------------- project config

// The brand's terracotta, split light/dark for contrast on each canvas.
const ACCENT_LIGHT = "#BC4F2C"; // deepened terracotta - readable on morning mist
const ACCENT_DARK = "#E0905A"; // clay glow - readable on warm midnight

// Handwritten asides + sign-off - DRAFTS in Shruthi's voice. Swap freely.
const NOTES = {
  pivot: "turns out nobody wanted a lecture. they wanted a feeling.",
  outcome: "139 strangers chose to stick around. still grinning.",
};

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "context", label: "context" },
  { id: "insights", label: "insights" },
  { id: "problem", label: "the problem" },
  { id: "brand", label: "the brand" },
  { id: "pivot", label: "the pivot" },
  { id: "outcome", label: "the outcome" },
  { id: "reflection", label: "reflection" },
] as const;

const META = [
  { label: "Timeline", value: "1 semester" }, // PLACEHOLDER - confirm
  { label: "Role", value: "Brand, Content & Strategy" },
  { label: "Team", value: "Amulya, Camila, Jenni & me" },
  { label: "Tools", value: "Figma, Illustrator, Adobe Express, Gemini Nano Banana" },
];

// Personas, trimmed to one breath each. `pos` frames the headshot in the crop.
const PERSONAS = [
  {
    name: "Maya Chen",
    meta: "32 · UX Designer · Portland",
    quote: "I want to live more intentionally but I don't know where to start.",
    file: "handmade-homestead/persona-maya.jpg",
    pos: "center 22%",
    cursor: "meet Maya",
  },
  {
    name: "Tom & Rachel",
    meta: "40s · Tutor & SWE · Austin",
    quote: "We want our kids to know where food comes from.",
    file: "handmade-homestead/persona-tom-rachel.jpg",
    pos: "center 38%",
    cursor: "meet Tom & Rachel",
  },
];

// Insights as short attribute phrases, not paragraphs. Each gets a saturated
// brand colour so the section reads as a designed moment, not a grid of cards.
const INSIGHTS = [
  { text: "They wanted a feeling, not a lecture.", bg: "#C65D3B", fg: "#F9F1E8" },
  { text: "Reach lived in shares, not posts.", bg: "#E0B75F", fg: "#3B2F2A" },
  { text: "Motion beat the message.", bg: "#A3B18A", fg: "#1F3A2E" },
];

const VALUES = ["Sustainability", "Education", "Community", "Craftsmanship"];

// Native colour swatches, grouped the way the brand guide groups them.
const PALETTE: { group: string; colors: { name: string; hex: string }[] }[] = [
  {
    group: "Primary",
    colors: [
      { name: "Terracotta", hex: "#C65D3B" },
      { name: "Forest Green", hex: "#1F3A2E" },
      { name: "Golden Yellow", hex: "#E0B75F" },
    ],
  },
  {
    group: "Secondary",
    colors: [
      { name: "Sage Green", hex: "#A3B18A" },
      { name: "Warm Peach", hex: "#D88A5B" },
    ],
  },
  {
    group: "Neutral",
    colors: [
      { name: "Cream", hex: "#F9F1E8" },
      { name: "Dark Brown", hex: "#3B2F2A" },
      { name: "Warm Gray", hex: "#C8BBAF" },
    ],
  },
];

const TYPE_SPECIMENS = [
  {
    name: "Oswald",
    role: "Headlines",
    sample: "ROOTED & HANDCRAFTED",
    className: oswald.className,
    style: { fontWeight: 600, letterSpacing: "0.02em" } as React.CSSProperties,
  },
  {
    name: "Lato",
    role: "Body",
    sample: "Made slowly, by hand, and meant to last.",
    className: lato.className,
    style: { fontWeight: 400 } as React.CSSProperties,
  },
  {
    name: "DynaPuff",
    role: "Accent",
    sample: "Handmade Homestead",
    className: dynaPuff.className,
    style: {} as React.CSSProperties,
  },
];

// The pivot, as short chips not paragraphs.
const ADAPTATIONS = [
  "AI-generated video",
  "Trending audio",
  "Compilation reels",
  "Collabs",
  "Real-time trends",
];

// The Inspire gallery, in two clean rows: tall reels on top, square merch below.
const INSPIRE_REELS = [
  { file: "handmade-homestead/reel-1.jpg", cursor: "watering season" },
  { file: "handmade-homestead/reel-2.jpg", cursor: "pass it on" },
  { file: "handmade-homestead/reel-3.jpg", cursor: "grow your own" },
];
const INSPIRE_MERCH = [
  { file: "handmade-homestead/merch-plush.jpg", cursor: "made by hand" },
  { file: "handmade-homestead/merch-tees.jpg", cursor: "a community worth wearing" },
  { file: "handmade-homestead/merch-pots.jpg", cursor: "for the windowsill" },
];

// The real educational posts (the "we taught and it fell flat" evidence).
const POSTS = [
  { file: "handmade-homestead/post-1.jpg", cursor: "rice water" },
  { file: "handmade-homestead/post-2.jpg", cursor: "pasta water" },
  { file: "handmade-homestead/post-3.jpg", cursor: "egg shells" },
];

const METRICS = [
  { value: 152.6, decimals: 1, suffix: "K", label: "views" },
  { value: 6.7, decimals: 1, suffix: "K", label: "interactions" },
  { value: 139, decimals: 0, suffix: "", label: "new followers" },
];

const SECONDARY_STATS = [
  { value: "131K+", label: "peak reel views" },
  { value: "640+", label: "shares, top reel" },
  { value: "6,000", label: "total likes" },
  { value: "700+", label: "total shares" },
];

const DEMOGRAPHICS = [
  { range: "18–24", pct: 53 },
  { range: "25–34", pct: 38 },
  { range: "35–44", pct: 7 },
  { range: "55–64", pct: 2 },
];

const TAGLINES = [
  "This is what homesteading looks like when it comes home with you.",
  "A community worth wearing.",
];

// ---------------------------------------------------------------- helpers

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg width="58" height="6" viewBox="0 0 58 6" fill="none" className={className} aria-hidden>
      <path
        d="M1 3.6C9 1.4 16 1.4 24 3.4S42 5.8 50 3.2 56 2.2 57 3.2"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowDoodle({ className = "" }: { className?: string }) {
  return (
    <svg width="44" height="34" viewBox="0 0 44 34" fill="none" className={className} aria-hidden>
      <path d="M2 5C16 6 31 12 38 27" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 27L28 25M38 27L35 17" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Inline handwritten margin note (desktop only - keeps mobile clean).
function Aside({
  children,
  rotate = -3,
  className = "",
}: {
  children: React.ReactNode;
  rotate?: number;
  className?: string;
}) {
  return (
    <div className={`hidden items-start gap-2 lg:flex ${className}`}>
      <ArrowDoodle className="mt-1 shrink-0" />
      <p
        className={`${rockSalt.className} max-w-[210px] text-[0.95rem] leading-snug`}
        style={{ color: "var(--accent)", transform: `rotate(${rotate}deg)` }}
      >
        {children}
      </p>
    </div>
  );
}

// Lowercase section label (Emma-style), with the hand-drawn squiggle.
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p
        className="font-mono text-caption-1 lowercase tracking-[0.04em]"
        style={{ color: "var(--accent)" }}
      >
        {children}
      </p>
      <Squiggle className="mt-1.5" />
    </div>
  );
}

// The one big statement per section - the only large type in the column.
// maxW defaults to ~30ch so statements wrap to 1-2 lines; pass "none" for one.
function Statement({
  children,
  className = "",
  maxW = "30ch",
}: {
  children: React.ReactNode;
  className?: string;
  maxW?: string;
}) {
  return (
    <h2
      className={`font-heading leading-[1.1] text-text ${className}`}
      style={{ maxWidth: maxW, fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h2>
  );
}

// Sparse supporting copy, held to a digestible line length.
function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`max-w-[60ch] font-body leading-relaxed text-muted ${className}`}
      style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)" }}
    >
      {children}
    </p>
  );
}

// Photo-or-placeholder. Renders the real image when the file exists; until then
// (and on any load error) it shows a terracotta-tinted dashed frame labelled
// with the exact filename to drop into /public/handmade-homestead/.
function Figure({
  src,
  alt,
  label,
  file,
  aspect = "aspect-video",
  position = "center",
  cursorLabel,
  className = "",
  rounded = "",
  parallax = true,
}: {
  src?: string;
  alt?: string;
  label: string;
  file: string;
  aspect?: string; // responsive Tailwind aspect class(es), e.g. "aspect-[4/3] sm:aspect-[3/2]"
  position?: string; // object-position, e.g. "center 30%" to frame a headshot
  cursorLabel?: string;
  className?: string;
  rounded?: string;
  parallax?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const showImage = !!src && !errored;
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Scrubbed parallax: the image is oversized and drifts as the frame passes
  // through the viewport. Only for real images, big frames, and full motion.
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
        className={`relative w-full overflow-hidden ${aspect} ${rounded} ${className}`}
        data-cursor-label={cursorLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
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

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed bg-surface/50 px-4 ${aspect} ${rounded} ${className}`}
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
      <span className="font-mono text-caption-2 lowercase tracking-wide text-muted/70">
        {file}
      </span>
    </div>
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

function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "up" | "fade" | "scale" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const hidden =
    variant === "fade"
      ? "opacity-0"
      : variant === "scale"
        ? "opacity-0 scale-[0.98]"
        : variant === "left"
          ? "opacity-0 -translate-x-10"
          : variant === "right"
            ? "opacity-0 translate-x-10"
            : "opacity-0 translate-y-8";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? "translate-x-0 translate-y-0 scale-100 opacity-100" : hidden} ${className}`}
    >
      {children}
    </div>
  );
}

function CountUp({
  value,
  suffix = "",
  decimals = 0,
  duration = 1400,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setN(value);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(eased * value);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);
  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString("en-US");
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

// A demographic bar that fills from 0 to its width when scrolled into view.
function GrowBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const reduced = prefersReduced();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);
  return (
    <div
      ref={ref}
      className="h-3 flex-1 overflow-hidden"
      style={{ backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)" }}
    >
      <div
        className="h-full"
        style={{
          width: shown ? `${pct}%` : "0%",
          backgroundColor: "var(--accent)",
          transition: reduced ? "none" : "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
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
              className={`pointer-events-none absolute left-7 whitespace-nowrap rounded-md bg-surface px-2 py-0.5 font-mono text-caption-2 lowercase tracking-wide shadow-sm transition-all duration-200 ease-out ${
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

// One section: a lowercase label, sparse copy, then room. Reading column is
// narrow; media inside can break out to the full content width.
function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 px-6 py-12 sm:px-10 md:py-20 lg:pl-32 lg:pr-12 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------- page

export function HandmadeHomesteadCaseStudy() {
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
        {/* 1 - OVERVIEW / HERO */}
        <section id="overview" className="scroll-mt-24 px-6 pb-8 pt-28 sm:px-10 md:pt-32 lg:pl-32 lg:pr-12">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h1
                className="font-display leading-[1.02] text-text"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                Handmade Homestead
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 max-w-[40ch] font-heading italic text-muted" style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)" }}>
                A homesteading lifestyle brand, grown from zero.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5 border-y border-border py-6">
                {META.map((m) => (
                  <div key={m.label}>
                    <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">{m.label}</dt>
                    <dd className="mt-1 font-body text-body text-text">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={240} variant="scale" className="mt-10">
              <Figure
                src="/handmade-homestead/hero.jpg"
                file="handmade-homestead/hero.jpg"
                label="Hero: brand banner / key visual"
                aspect="aspect-[4/3] sm:aspect-[3/2]"
                cursorLabel="the brand, at a glance"
              />
            </Reveal>

            <Reveal delay={120}>
              <p
                className="mt-12 font-heading leading-[1.12] text-text"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.01em" }}
              >
                <span className="block">
                  How do you make someone <span className="italic" style={{ color: "var(--accent)" }}>feel</span> slow living,
                </span>
                <span className="block">not just scroll past it?</span>
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Body className="mt-6">
                One semester. Four of us. Zero followers, and a homestead to grow from a blank page (no land, no barn, no chickens, just Figma and a lot of opinions).
              </Body>
            </Reveal>
          </div>
        </section>

        {/* 2 - CONTEXT */}
        <Section id="context">
          <Reveal>
            <Label>context</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Two very different people, chasing the same quiet thing.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Everyone wants to live more intentionally. Almost no one knows where to start. We built for the gap in between.
            </Body>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {PERSONAS.map((p, i) => (
              <Reveal key={p.name} delay={i * 90} variant={i === 0 ? "left" : "right"}>
                <div className="flex h-full flex-col overflow-hidden border border-border bg-surface">
                  <Figure
                    src={`/${p.file}`}
                    file={p.file}
                    label="Portrait"
                    aspect="aspect-[5/4] sm:aspect-[3/2]"
                    position={p.pos}
                    cursorLabel={p.cursor}
                    rounded="rounded-none"
                    parallax={false}
                  />
                  <div className="p-6">
                    <h3 className="font-heading text-h4 leading-tight text-text">{p.name}</h3>
                    <p className="mt-0.5 font-mono text-caption-2 uppercase tracking-wide text-muted">{p.meta}</p>
                    <p className="mt-3 font-body leading-snug text-text" style={{ fontSize: "1.05rem" }}>
                      &ldquo;{p.quote}&rdquo;
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 3 - INSIGHTS */}
        <Section id="insights">
          <Reveal>
            <Label>insights</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Three things the data made impossible to ignore.</Statement>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {INSIGHTS.map((c, i) => (
              <Reveal
                key={c.text}
                delay={i * 90}
                variant={i === 0 ? "left" : i === 2 ? "right" : "up"}
                className="h-full"
              >
                <div
                  className="flex h-full flex-col gap-10 p-8"
                  style={{ backgroundColor: c.bg, color: c.fg }}
                >
                  <span className="font-display" style={{ fontSize: "2.25rem", fontWeight: 700, lineHeight: 1, opacity: 0.5 }}>
                    0{i + 1}
                  </span>
                  <p className="font-heading leading-snug" style={{ fontSize: "clamp(1.3rem, 1.9vw, 1.6rem)" }}>
                    {c.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 4 - THE PROBLEM */}
        <Section id="problem">
          <Reveal>
            <Label>the problem</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">We launched education-first. The graph flatlined.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Carousels and infographics taught well and traveled nowhere. People didn&rsquo;t want to be informed. They wanted to be moved.
            </Body>
          </Reveal>
          {/* the actual educational posts: beautiful, and they didn't travel */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {POSTS.map((p, i) => (
              <Reveal key={p.file} delay={i * 80} variant="scale" className={i === 2 ? "col-span-2 sm:col-span-1" : ""}>
                <Figure
                  src={`/${p.file}`}
                  file={p.file}
                  label="Educational post"
                  aspect="aspect-[4/5]"
                  cursorLabel={p.cursor}
                  parallax={false}
                />
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 5 - THE BRAND (solution): identity shown large */}
        <Section id="brand">
          <Reveal>
            <Label>the brand</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">So we built something you could feel.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">Rooted and handcrafted: warm color, organic forms, made by hand.</Body>
          </Reveal>

          {/* the mark, applied */}
          <div className="mt-12 grid items-center gap-8 md:grid-cols-2">
            <Reveal variant="left">
              <Figure
                src="/handmade-homestead/logo.jpg"
                file="handmade-homestead/logo.jpg"
                label="The mark"
                aspect="aspect-square"
                cursorLabel="the mark"
              />
            </Reveal>
            <Reveal variant="right" delay={80}>
              <div>
                <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                  the mark
                </p>
                <h3
                  className="mt-3 font-heading text-text"
                  style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)", lineHeight: 1.15 }}
                >
                  A bottle and a doorway, in one little H.
                </h3>
                <Body className="mt-4">
                  A ceramic bottle meets an arched home. The whole palette, in a single stamp.
                </Body>
              </div>
            </Reveal>
          </div>

          {/* values - four words, that's it */}
          <Reveal delay={80} className="mt-12">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {VALUES.map((v) => (
                <span key={v} className="font-heading text-text" style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)" }}>
                  {v}
                </span>
              ))}
            </div>
          </Reveal>

          {/* palette - native swatches */}
          <div className="mt-14 space-y-6">
            {PALETTE.map((row, ri) => (
              <Reveal key={row.group} delay={ri * 60}>
                <div>
                  <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">{row.group}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {row.colors.map((c) => (
                      <div key={c.hex} className="w-28">
                        <div
                          className="h-24 w-full border border-border"
                          style={{ backgroundColor: c.hex }}
                          data-cursor-label={c.name}
                        />
                        <p className="mt-2 font-body text-caption-1 text-text">{c.name}</p>
                        <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">{c.hex}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* type - real faces */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TYPE_SPECIMENS.map((t, i) => (
              <Reveal key={t.name} delay={i * 70}>
                <div className="flex h-full flex-col border border-border p-7" style={{ backgroundColor: "var(--bg)" }}>
                  <p className={`${t.className} text-text`} style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)", lineHeight: 1.1, ...t.style }}>
                    {t.sample}
                  </p>
                  <div className="mt-auto pt-6">
                    <p className={`${t.className} text-h4 text-text`} style={t.style}>{t.name}</p>
                    <p className="mt-0.5 font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 6 - THE PIVOT */}
        <Section id="pivot">
          <Reveal>
            <Label>the pivot</Label>
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-5 flex items-start justify-between gap-6">
              <Statement>Inspire, don&rsquo;t inform.</Statement>
              <Aside className="mt-2 shrink-0" rotate={-3}>
                {NOTES.pivot}
              </Aside>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">We rebuilt the content engine around feeling, then chased the trends in real time.</Body>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {ADAPTATIONS.map((a) => (
                <span
                  key={a}
                  className="rounded-full px-4 py-1.5 font-mono text-caption-1 lowercase tracking-wide"
                  style={{ color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)" }}
                >
                  {a}
                </span>
              ))}
            </div>
          </Reveal>

          {/* inspire gallery - two clean rows: tall reels, then square merch */}
          <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-6">
            {INSPIRE_REELS.map((m, i) => (
              <Reveal key={m.file} delay={i * 80} variant={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                <Figure src={`/${m.file}`} file={m.file} label="Reel" aspect="aspect-[2/3]" cursorLabel={m.cursor} />
              </Reveal>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 sm:mt-6 sm:gap-6">
            {INSPIRE_MERCH.map((m, i) => (
              <Reveal key={m.file} delay={i * 80} variant={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                <Figure src={`/${m.file}`} file={m.file} label="Merch" aspect="aspect-square" cursorLabel={m.cursor} />
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 7 - THE OUTCOME */}
        <Section id="outcome">
          <Reveal>
            <Label>the outcome</Label>
          </Reveal>
          <Reveal delay={60}>
            <div className="mt-5 flex items-start justify-between gap-6">
              <Statement maxW="none" className="sm:whitespace-nowrap">
                The reels did the talking.
              </Statement>
              <Aside className="mt-2 shrink-0" rotate={3}>
                {NOTES.outcome}
              </Aside>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <div className="border border-border p-8" style={{ backgroundColor: "var(--bg)" }}>
                  <p
                    className="font-display"
                    style={{ color: "var(--accent)", fontSize: "clamp(2.75rem, 6vw, 4.5rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}
                  >
                    <CountUp value={m.value} suffix={m.suffix} decimals={m.decimals} />
                  </p>
                  <Body className="mt-2">{m.label}</Body>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {SECONDARY_STATS.map((s) => (
                <div key={s.label} className="border border-border px-5 py-4" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="font-heading text-h4 leading-none text-text">{s.value}</p>
                  <p className="mt-1.5 font-body text-caption-1 text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 max-w-2xl">
              <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">who showed up (by age)</p>
              <div className="mt-4 space-y-3">
                {DEMOGRAPHICS.map((d, i) => (
                  <div key={d.range} className="flex items-center gap-4">
                    <span className="w-16 shrink-0 font-mono text-caption-1 text-text">{d.range}</span>
                    <GrowBar pct={d.pct} delay={i * 120} />
                    <span className="w-10 shrink-0 text-right font-mono text-caption-1 text-muted">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Section>

        {/* 8 - REFLECTION / CLOSE */}
        <Section id="reflection" className="py-28 md:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal variant="fade">
              <div className="flex flex-col items-center">
                <Label>reflection</Label>
              </div>
            </Reveal>
            <Reveal variant="fade" delay={120}>
              <p className="mt-8 font-heading leading-[1.5] text-text" style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.8rem)" }}>
                A brand is a feeling before it&rsquo;s a logo. The moment we stopped explaining slow living and started showing it, people leaned in, shared it, and stayed.
              </p>
            </Reveal>
            <Reveal variant="fade" delay={200}>
              <div className="mt-12 flex flex-col items-center gap-3">
                {TAGLINES.map((t) => (
                  <p
                    key={t}
                    className={rockSalt.className}
                    style={{ color: "var(--accent)", fontSize: "clamp(1.05rem, 1.8vw, 1.35rem)", lineHeight: 1.5 }}
                  >
                    {t}
                  </p>
                ))}
              </div>
            </Reveal>
            <Reveal variant="fade" delay={280}>
              <p className="mt-12 font-mono text-caption-1 lowercase tracking-wide text-muted">
                made with soil under our nails, and a lot of love.
              </p>
            </Reveal>
          </div>
        </Section>
      </div>
    </div>
  );
}
