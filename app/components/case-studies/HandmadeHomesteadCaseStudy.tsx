

"use client";

import { useEffect, useRef, useState } from "react";
import { Rock_Salt, Oswald, Lato, DynaPuff } from "next/font/google";
import { useTheme } from "@/app/components/shared/ThemeProvider";
import { gsap, useGSAP } from "@/app/lib/gsap";

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

// Section order reads chronologically through the project: meet the people →
// build the brand → hit the wall → see what the data showed → pivot → win.
// IDs are kept stable so deep-links don't break; only labels and order change.
const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "context", label: "context" },
  { id: "brand", label: "creating branding and strategy" },
  { id: "research", label: "research" },
  { id: "problem", label: "the challenge" },
  { id: "insights", label: "insights" },
  { id: "pivot", label: "the pivot and adapt" },
  { id: "outcome", label: "outcomes" },
  { id: "reflection", label: "reflection" },
] as const;

// `href` is optional - when present, the value renders as a click-through
// link (used for the live Instagram pointer below).
const META: { label: string; value: string; href?: string }[] = [
  { label: "Timeline", value: "3 weeks" },
  { label: "Role", value: "Brand, Strategy and Visual Assets" },
  { label: "Team", value: "Shruthi, Camila, Jenni & Amulya" },
  { label: "Tools", value: "Figma, Illustrator, Adobe Express, Gemini Nano Banana" },
  {
    label: "Live",
    value: "@homesteadhandmadebyus",
    href: "https://www.instagram.com/homesteadhandmadebyus",
  },
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

// Insights as a punchy headline + the evidence underneath (from the project
// deck). Each gets a saturated brand colour so the section reads as a
// designed moment, not a grid of cards.
const INSIGHTS = [
  {
    text: "They wanted a feeling, not a lecture.",
    body: "Reels showing the feeling of slow living (aesthetic, process, outcome) drove significantly higher engagement than instructional posts.",
    bg: "#C65D3B",
    fg: "#F9F1E8",
  },
  {
    text: "Reach lived in shares, not posts.",
    body: "Top reels (131K+ views, 640+ shares) spread well beyond our follower base. Relatable, appealing content unlocked organic distribution.",
    bg: "#E0B75F",
    fg: "#3B2F2A",
  },
  {
    text: "Motion beat the message.",
    body: "Content via reels (motion + audio) outperformed static carousels on reach, saves, and shares at every measurement.",
    bg: "#A3B18A",
    fg: "#1F3A2E",
  },
];

// Four values rendered as colored cards. Each pulls a brand palette color so
// the values block becomes a visual application of the palette - not just a
// label list. fg is chosen for WCAG-passing contrast on bg.
const VALUES = [
  { name: "Sustainability", caption: "Care that lasts.", bg: "#1F3A2E", fg: "#F9F1E8" }, // forest / cream
  { name: "Education", caption: "Skills that root.", bg: "#C65D3B", fg: "#F9F1E8" },     // terracotta / cream
  { name: "Community", caption: "Shared hands, shared ground.", bg: "#A3B18A", fg: "#1F3A2E" }, // sage / forest
  { name: "Craftsmanship", caption: "Made slow, made by hand.", bg: "#E0B75F", fg: "#3B2F2A" }, // golden / brown
];

// The five visual language principles - the design rules that hold the
// brand together (sourced from the brand theme deck).
const VISUAL_LANGUAGE = [
  "Organic wavy line work",
  "Nature motifs",
  "Layered, flowing compositions",
  "Warm and earthy palette",
  "Expressive, slightly imperfect forms",
];

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
// The 5 R's of sustainability - the framework that scoped the original
// education content. Order matters: it's a waste hierarchy (refuse first,
// recycle last).
const FIVE_RS = ["Refuse", "Reduce", "Reuse", "Repurpose (or Rot)", "Recycle"];

// Two goals + three tactics that rolled up to them - the original content
// strategy before the data forced a pivot. Sourced from the strategy deck.
const CONTENT_GOALS = [
  { name: "Goal 1", body: "Expand reach and promote eco-friendly lifestyles.", bg: "#1F3A2E", fg: "#F9F1E8" },
  { name: "Goal 2", body: "Encourage sign-ups and build a loyal community.", bg: "#A3B18A", fg: "#1F3A2E" },
];

const CONTENT_TACTICS = [
  { name: "Carousels", body: "Educational tips, infographics, beginner guides." },
  { name: "Reels",     body: "ASMR, process videos, eco printing." },
  { name: "Polls",     body: "Interactive story engagement and in-post comments." },
];

// What we changed when education-first didn't travel. Each adaptation gets
// a name + a one-line explanation. Numbered list pattern matches the visual
// language and 5 R's elsewhere on the page.
// Three takeaways from the project + three things we'd push further with
// more time. Both lifted from the project deck.
const TAKEAWAYS = [
  {
    name: "Education-first didn’t match user behavior",
    body: "Users engaged more with inspiration-led content than structured, informational posts.",
  },
  {
    name: "Platform fit matters",
    body: "Reels, trends, and motion-driven storytelling significantly improved reach and discoverability.",
  },
  {
    name: "Adaptability drove better results",
    body: "Shifting from planned content to trend-responsive posting increased engagement and growth.",
  },
];

const NEXT_STEPS = [
  "Build awareness through campus workshops",
  "Strengthen focus on younger audiences",
  "Go deeper with tutorial-based content",
];

const ADAPTATIONS = [
  { name: "AI-generated video", body: "Replaced static infographics with dynamic visual content." },
  { name: "Trending audio",     body: "Aligned content with sounds already resonating on the platform." },
  { name: "Compilation reels",  body: "Moved from single-topic posts to satisfying multi-clip videos." },
  { name: "Collabs",            body: "Partnered with other teams to expand reach and credibility." },
  { name: "Moving with trends", body: "Shifted from planned topics to real-time trend response." },
];

// The mark across four brand canvases. Source aspect is 16:9.
// Order is intentional so the 2x2 grid reads as two stories:
//   Row 1 - the H-mark on its two canvases (warm + dark)
//   Row 2 - the wordmark and the full lockup, both on green (system at rest)
const LOCKUPS = [
  { file: "handmade-homestead/lockup-1.png", label: "Mark on terracotta", cursor: "mark / warm" },
  { file: "handmade-homestead/lockup-3.png", label: "Mark on forest green", cursor: "mark / dark" },
  { file: "handmade-homestead/lockup-2.png", label: "Wordmark on forest green", cursor: "wordmark" },
  { file: "handmade-homestead/lockup-4.png", label: "Full lockup with vase motifs", cursor: "the lockup" },
];

// Notebook storyboards behind the IG post pivot. Aspects vary (sketch-3 is
// landscape), so we render them with object-contain on a paper-toned card
// rather than crop them into a uniform shape.
const SKETCHES = [
  { file: "handmade-homestead/sketch-1.jpg", cursor: "post 08 storyboard" },
  { file: "handmade-homestead/sketch-2.jpg", cursor: "posts 06 & 07" },
  { file: "handmade-homestead/sketch-3.jpg", cursor: "post 04 premium tax" },
];

// The four reels - the brand's four pillars, each framed inside the H-mark
// as a window. Source aspect is ~9:19.5; we render at 9:16 with object-cover.
const REELS = [
  { file: "handmade-homestead/reel-grow.png", label: "Grow reel", cursor: "grow" },
  { file: "handmade-homestead/reel-cook.png", label: "Cook reel", cursor: "cook" },
  { file: "handmade-homestead/reel-craft.png", label: "Craft reel", cursor: "craft" },
  { file: "handmade-homestead/reel-learn.png", label: "Learn reel", cursor: "learn" },
];

// The 7 educational IG posts (the pre-pivot work that didn't travel).
// Source aspect is 4:5 (1080x1350) - Instagram portrait. Display order:
// "Benefits of composting" leads as the intro (its general framing reads
// better as an opener), then the bin-lying hook, then the 4 scrap
// pairings, then the CTA closer. Filenames stay tied to the source set;
// only display order changed.
const INSTAPOSTS = [
  { file: "handmade-homestead/instapost/6.jpg", cursor: "benefits of composting",  title: "Benefits of composting",        body: "Saves money. Cuts waste. Better for everything." },
  { file: "handmade-homestead/instapost/1.jpg", cursor: "your bin lying to you",   title: "Your bin has been lying to you", body: "The hook. Kitchen scraps you’ve been throwing away are quietly powerful." },
  { file: "handmade-homestead/instapost/2.jpg", cursor: "rice water",              title: "Rice water",                     body: "Ferment longer for impact. Boosts microbes, feeds roots." },
  { file: "handmade-homestead/instapost/3.jpg", cursor: "citrus peels",            title: "Citrus peels",                   body: "Repels ants. Improves nutrition. Becomes compost." },
  { file: "handmade-homestead/instapost/4.jpg", cursor: "pasta water",             title: "Pasta water",                    body: "Feeds bacteria. Boosts growth. Kills weeds." },
  { file: "handmade-homestead/instapost/5.jpg", cursor: "egg shells",              title: "Egg shells",                     body: "Feeds calcium. Deters slugs. Strengthens stems." },
  { file: "handmade-homestead/instapost/7.jpg", cursor: "what's next",             title: "What are you composting next?",  body: "The CTA closer. The post that turned scrolls into shares." },
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

// Section eyebrow + hand-drawn squiggle. Uppercase mono accent — matches the
// pattern used across all case studies.
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p
        className="font-mono text-caption-1 uppercase tracking-wide"
        style={{ color: "var(--accent)" }}
      >
        {children}
      </p>
    </div>
  );
}

// The one big statement per section. Defaults to full section width (no maxW)
// so headings extend across the whole editorial column; pass an explicit
// `maxW` if a specific Statement needs to wrap tighter.
function Statement({
  children,
  className = "",
  maxW = "none",
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

// Supporting copy — extends to the full section width.
function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`font-body leading-relaxed text-muted ${className}`}
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
}) {
  const [errored, setErrored] = useState(false);
  const showImage = !!src && !errored;

  if (showImage) {
    return (
      <div
        className={`relative w-full overflow-hidden ${aspect} ${rounded} ${className}`}
        data-cursor-label={cursorLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
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

// One section: a lowercase label, sparse copy, then room. Reading column is
// narrow; media inside can break out to the full content width.
/**
 * PinnedPostsSweep - the 7 IG posts as a pinned horizontal-scroll sequence.
 *
 * Desktop (md+): the wrap pins for the duration of the sweep; vertical
 * scroll scrubs the inner track's translateX from 0 to -(scrollWidth - 100vw).
 * Each card is post (left, ~70vh tall) + caption (right) inside a 75vw
 * column, so ~1.3 cards are visible at a time and the next one peeks in.
 *
 * Mobile (<md) and reduced-motion: pin disabled, cards stack vertically
 * with image + caption stacked per card. Same content, no scrubbed motion.
 *
 * Progress bar at the bottom of the pinned viewport tracks position 1..7.
 */
function PinnedPostsSweep() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      if (!wrap || !track) return;
      if (prefersReduced()) return;

      // Pinned sweep only at md+ (768px). matchMedia auto-cleans on resize.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            pin: true,
            scrub: 0.5,
            start: "top top",
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progress) progress.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden md:h-screen md:min-h-[720px]">
      {/* Eyebrow above the sweep on desktop, sits inside the pinned area */}
      <div className="pointer-events-none absolute left-0 right-0 top-6 z-10 hidden md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-10">
          <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
            seven posts, one story
          </p>
          <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">
            scroll to advance &rarr;
          </p>
        </div>
      </div>

      <div className="md:flex md:h-full md:items-center">
        <div
          ref={trackRef}
          className="flex flex-col gap-12 px-6 sm:px-10 md:flex-row md:items-center md:gap-10 md:px-[6vw] md:py-12 md:will-change-transform"
        >
          {INSTAPOSTS.map((p, i) => (
            <article
              key={p.file}
              className="relative flex-shrink-0 md:h-[78vh] md:max-h-[760px]"
              style={{ aspectRatio: "4 / 5" }}
            >
              <Figure
                src={`/${p.file}`}
                file={p.file}
                label="Instagram post"
                aspect="aspect-[4/5] md:aspect-auto md:h-full"
                cursorLabel={p.cursor}
                className="md:h-full"
              />
              {/* 01 / 07 counter chip, top-left of each image. The 'rest'
                  number stays muted so the active position stands out. */}
              <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-baseline gap-1 rounded-full bg-text/85 px-3 py-1.5 backdrop-blur-sm">
                <span
                  className="font-mono text-caption-2 uppercase tracking-wider"
                  style={{ color: "var(--bg)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="font-mono text-caption-2 uppercase tracking-wider"
                  style={{ color: "var(--bg)", opacity: 0.55 }}
                >
                  &nbsp;/&nbsp;07
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Progress bar - scales via GSAP onUpdate, only visible on desktop */}
      <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-10 hidden md:block">
        <div className="mx-auto max-w-7xl px-10">
          <div className="h-px w-full" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
            <div
              ref={progressRef}
              className="h-px origin-left"
              style={{ backgroundColor: "var(--accent)", transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * WhatWeChangedTabs - interactive tabbed reveal of the 5 adaptations.
 *
 * Row of 5 numbered tabs at top; click any (or use Arrow Left/Right when
 * focused) to expand one detailed card with name + body. Active tab gets
 * the accent color + an under-rule that slides between positions. ARIA
 * tablist/tab/tabpanel roles so the pattern reads correctly to assistive
 * tech. Stateful — tab choice persists for the session.
 */
function WhatWeChangedTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow-key navigation between tabs when one is focused. Left wraps to
  // last, right wraps to first, so it feels like a single ring of options.
  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = e.key === "ArrowRight" ? (active + 1) % ADAPTATIONS.length : (active - 1 + ADAPTATIONS.length) % ADAPTATIONS.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const item = ADAPTATIONS[active];

  return (
    <div className="mt-5">
      {/* Tablist - 5 numbered buttons distributed evenly across the
          section width. Grid-cols-5 at md+ gives equal columns; collapses
          to grid-cols-2 (then 3) on small screens so labels never crunch.
          Each cell stretches to fill its column so the under-rule reads
          as a continuous segmented bar. */}
      <div
        role="tablist"
        aria-label="What we changed"
        className="grid grid-cols-2 gap-x-4 gap-y-6 border-b border-border pb-3 sm:grid-cols-3 md:grid-cols-5 md:gap-x-8"
      >
        {ADAPTATIONS.map((a, i) => {
          const isActive = i === active;
          return (
            <button
              key={a.name}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`changed-panel-${i}`}
              id={`changed-tab-${i}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={onTabKey}
              data-cursor-label={a.name.toLowerCase()}
              // The AI-video tab gets a cursor IMAGE preview - an actual
              // AI-generated thumbnail floats with the cursor in place of
              // the text pill. CircleCursor reads `data-cursor-image` and
              // swaps the pill content for the image.
              data-cursor-image={i === 0 ? "/handmade-homestead/ai-preview.jpg" : undefined}
              className="group relative flex w-full flex-col items-start gap-1 pb-2 text-left transition-colors duration-150 outline-none"
              style={{
                color: isActive ? "var(--accent)" : "var(--color-muted)",
              }}
            >
              <span
                className="font-display leading-none"
                style={{
                  fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  opacity: isActive ? 1 : 0.55,
                  transition: "opacity 150ms ease",
                }}
              >
                0{i + 1}
              </span>
              <span
                className="font-mono text-caption-2 uppercase tracking-wide"
                style={{
                  opacity: isActive ? 1 : 0.7,
                  transition: "opacity 150ms ease",
                }}
              >
                {a.name}
              </span>
              {/* Active under-rule: a 2px line that lives in the active tab.
                  Drawn here rather than as a sliding element since each tab
                  has its own width (no easy single moving rule). */}
              <span
                aria-hidden
                className="absolute left-0 right-0 bottom-[-13px] h-[2px] transition-opacity duration-200"
                style={{
                  backgroundColor: "var(--accent)",
                  opacity: isActive ? 1 : 0,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Panel - swaps via `key` so React re-renders and the inline
          keyframe (defined just below) plays each switch. min-h prevents
          layout jump as bodies vary. */}
      <style>{`
        @keyframes hh-tab-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        role="tabpanel"
        id={`changed-panel-${active}`}
        aria-labelledby={`changed-tab-${active}`}
        key={active}
        className="mt-10 grid gap-6 md:grid-cols-[1fr_2fr] md:gap-12"
        style={{ minHeight: "9rem", animation: "hh-tab-in 360ms ease both" }}
      >
        <div>
          <p
            className="font-display"
            style={{
              color: "var(--accent)",
              fontSize: "clamp(3rem, 7vw, 5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            0{active + 1}
          </p>
          <p
            className="mt-3 font-mono text-caption-2 uppercase tracking-wide"
            style={{ color: "var(--accent)" }}
          >
            {String(active + 1).padStart(2, "0")} / {String(ADAPTATIONS.length).padStart(2, "0")}
          </p>
        </div>
        <div>
          <h3
            className="font-heading leading-tight text-text"
            style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)", letterSpacing: "-0.01em" }}
          >
            {item.name}
          </h3>
          <p
            className="mt-4 font-body leading-snug text-text"
            style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.2rem)", maxWidth: "52ch" }}
          >
            {item.body}
          </p>
        </div>
      </div>
    </div>
  );
}

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
    <section id={id} className={`scroll-mt-24 px-6 py-8 sm:px-10 md:py-12 lg:pl-32 lg:pr-12 ${className}`}>
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
                    <dd className="mt-1 font-body text-body text-text">
                      {m.href ? (
                        // External live link - opens in a new tab with rel
                        // noopener+noreferrer for safety. Shared format across
                        // every case study: underline at rest, accent on hover.
                        <a
                          href={m.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor-label={`visit ${m.value}`}
                          className="underline decoration-1 underline-offset-4 transition-colors hover:text-[var(--accent)]"
                        >
                          {m.value}
                        </a>
                      ) : (
                        m.value
                      )}
                    </dd>
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
                Four of us. Zero followers, and a homestead to grow from a blank page (no land, no barn, no chickens, just Figma and a lot of opinions).
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

        {/* 3 - CREATING BRANDING AND STRATEGY (the brand) */}
        <Section id="brand">
          <Reveal>
            <Label>creating branding and strategy</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">So we built something you could feel.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">Rooted and handcrafted: warm color, organic forms, made by hand.</Body>
          </Reveal>

          {/* Vision + Mission - the north star, set before any visual decision.
             Side-by-side at md+; stacks on mobile. The headers sit in the
             accent eyebrow so the prose can carry weight. */}
          <Reveal delay={160} className="mt-14">
            <div className="grid gap-10 md:grid-cols-2 md:gap-14">
              <div>
                <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                  Vision
                </p>
                <p
                  className="mt-4 font-heading text-text"
                  style={{ fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.4 }}
                >
                  We are here to create a world where gardens thrive, handmade goods fill our homes, and people live more intentionally.
                </p>
              </div>
              <div>
                <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                  Mission
                </p>
                <p
                  className="mt-4 font-heading text-text"
                  style={{ fontSize: "clamp(1.2rem, 2vw, 1.55rem)", lineHeight: 1.4 }}
                >
                  To bring the spirit of the homestead back into everyday life by teaching modern homesteading skills through hands-on workshops, local pop-ups, and a thoughtfully curated collection of artisanal goods.
                </p>
              </div>
            </div>
          </Reveal>

          {/* The mark across four canvases - one identity that travels.
             2x2 grid at md+; single column on mobile. Each cell is 16:9 to
             match the source ratio so nothing crops. */}
          <div className="mt-14 grid gap-4 md:grid-cols-2 md:gap-6">
            {LOCKUPS.map((l, i) => (
              <Reveal
                key={l.file}
                delay={(i % 2) * 80}
                variant={i % 2 === 0 ? "left" : "right"}
              >
                <Figure
                  src={`/${l.file}`}
                  file={l.file}
                  label={l.label}
                  aspect="aspect-[16/9]"
                  cursorLabel={l.cursor}
                />
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-8">
            <div className="max-w-3xl">
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

          {/* The five visual language principles - the design rules that
             carry across every piece. Sits between the mark explanation and
             the values cards so the brand section reads as: mark -> language
             -> values -> palette -> type. */}
          <Reveal delay={80} className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              the visual language
            </p>
            <h3
              className="mt-3 font-heading leading-tight text-text"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
            >
              Rooted, handcrafted, slightly imperfect.
            </h3>
            <Body className="mt-4 max-w-3xl">
              Every visual choice reflects the care and intentionality at the heart of homesteading life.
            </Body>
          </Reveal>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {VISUAL_LANGUAGE.map((v, i) => (
              <Reveal key={v} delay={i * 60} variant="up">
                <div
                  className="flex h-full items-start gap-3 border-l-2 py-2 pl-4"
                  style={{ borderColor: "var(--accent)" }}
                >
                  <span
                    className="font-mono text-caption-2 uppercase tracking-wide pt-0.5"
                    style={{ color: "var(--accent)", opacity: 0.7 }}
                  >
                    0{i + 1}
                  </span>
                  <p className="font-body text-text" style={{ fontSize: "0.98rem", lineHeight: 1.4 }}>
                    {v}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* values - 4 palette-tied colored cards. Value name in display
             type, 1-line meaning underneath. Each card uses a brand color
             with chosen-for-contrast foreground. 2x2 on small screens, 4-up
             on md+. */}
          <Reveal delay={80} className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">values</p>
          </Reveal>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {VALUES.map((v, i) => (
              <Reveal
                key={v.name}
                delay={i * 70}
                variant={i % 2 === 0 ? "left" : "right"}
              >
                <div
                  className="flex h-full flex-col justify-between gap-10 p-6 sm:p-7"
                  style={{ backgroundColor: v.bg, color: v.fg, minHeight: "13rem" }}
                  data-cursor-label={v.name.toLowerCase()}
                >
                  <span
                    className="font-display"
                    style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1, opacity: 0.55 }}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <p
                      className="font-heading leading-tight"
                      style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)" }}
                    >
                      {v.name}
                    </p>
                    <p
                      className="mt-2 font-body leading-snug"
                      style={{ fontSize: "0.98rem", opacity: 0.85 }}
                    >
                      {v.caption}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* palette - all 8 swatches in a single row that fills the section
             width. CSS grid with grid-cols-4 (mobile) -> grid-cols-8 (md+)
             gives evenly-distributed swatches that grow with the column,
             so the row hits the right edge instead of ending in dead space. */}
          <Reveal className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">palette</p>
            <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-8 md:gap-4">
              {PALETTE.flatMap((row) => row.colors).map((c, i) => (
                <Reveal key={c.hex} delay={i * 40}>
                  <div>
                    <div
                      className="aspect-[5/4] w-full border border-border md:aspect-square"
                      style={{ backgroundColor: c.hex }}
                      data-cursor-label={c.name}
                    />
                    <p className="mt-2 font-body text-caption-1 text-text">{c.name}</p>
                    <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">{c.hex}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

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

          {/* Brand mood board - the closing synthesis. Everything explained
             above (mark, palette, type, voice), applied to real moments:
             posts, mockups, totes, products. The "and here it all is
             together" beat. Source is near-square; rendered at full
             section width with a small eyebrow + closer caption. */}
          <Reveal className="mt-20">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              the brand, in the world
            </p>
            <h3
              className="mt-3 font-heading leading-tight text-text"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
            >
              All of it, applied.
            </h3>
          </Reveal>
          <Reveal delay={80} className="mt-7" variant="scale">
            <Figure
              src="/handmade-homestead/brand-board.jpg"
              file="handmade-homestead/brand-board.jpg"
              label="Brand applications mood board"
              aspect="aspect-square"
              cursorLabel="brand at a glance"
            />
          </Reveal>
        </Section>

        {/* 4 - RESEARCH (educate and inform - the strategy that informed the
             first content engine, before the pivot. Two frameworks: the 80/20
             split that shaped the content mix, and the 5 R's that shaped the
             topical scope. Lives between brand and problem so the narrative
             reads: brand decisions -> the research that drove the strategy ->
             the strategy that flatlined.) */}
        <Section id="research">
          <Reveal>
            <Label>research</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Before we made anything, we made decisions.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Two frameworks set the tone. One shaped the content mix. The other shaped what each post was about.
            </Body>
          </Reveal>

          {/* Two-up: 80/20 on the left, the 5 R's on the right.
             Stacks on mobile. Eyebrow + heading + body in each, mirroring
             the editorial pattern used elsewhere on the page. */}
          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
            <Reveal variant="left">
              <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                the 80 / 20 strategy
              </p>
              <h3
                className="mt-3 font-heading leading-tight text-text"
                style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
              >
                Educate first, inform second.
              </h3>
              <Body className="mt-4">
                80% of content educated our audience on the benefits and returns of homesteading. 20% informed them about resources, workshops, and ways to get involved.
              </Body>
            </Reveal>

            <Reveal variant="right" delay={80}>
              <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                the five R&rsquo;s
              </p>
              <h3
                className="mt-3 font-heading leading-tight text-text"
                style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
              >
                A hierarchy, not a checklist.
              </h3>
              <Body className="mt-4">
                Investigated current sustainability trends and the waste challenges of retail, then scoped content around the hierarchy: refuse first, recycle last.
              </Body>
              {/* The 5 verbs as pills - reads as a single ordered sequence */}
              <div className="mt-5 flex flex-wrap gap-2">
                {FIVE_RS.map((r, i) => (
                  <span
                    key={r}
                    className="rounded-full px-4 py-1.5 font-mono text-caption-1 uppercase tracking-wide"
                    style={{
                      color: "var(--accent)",
                      border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                    }}
                  >
                    <span className="opacity-60">0{i + 1}</span>&nbsp;&nbsp;{r}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Content decisions - two goals, three tactics that rolled up to
             them. The goal pair lands as colored cards (matching the values
             cards' visual treatment); the tactics sit below as light cards.
             This is what we set out to ship; the next section is where it
             didn't work. */}
          <Reveal className="mt-16">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              content decisions
            </p>
            <h3
              className="mt-3 font-heading leading-tight text-text"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
            >
              Two goals, three tactics.
            </h3>
          </Reveal>

          <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-5">
            {CONTENT_GOALS.map((g, i) => (
              <Reveal
                key={g.name}
                delay={i * 80}
                variant={i % 2 === 0 ? "left" : "right"}
              >
                <div
                  className="flex h-full flex-col gap-3 p-6 sm:p-7"
                  style={{ backgroundColor: g.bg, color: g.fg, minHeight: "9rem" }}
                >
                  <p
                    className="font-mono text-caption-2 uppercase tracking-wide"
                    style={{ opacity: 0.75 }}
                  >
                    {g.name}
                  </p>
                  <p
                    className="font-heading leading-snug"
                    style={{ fontSize: "clamp(1.15rem, 1.9vw, 1.4rem)" }}
                  >
                    {g.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Tactics: three cards on light backgrounds, numbered like the
             other "5 R's"-style sequences for visual rhythm. */}
          <div className="mt-5 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {CONTENT_TACTICS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80} variant="up">
                <div
                  className="flex h-full flex-col gap-2 border border-border p-6"
                  style={{ backgroundColor: "var(--bg)" }}
                >
                  <p
                    className="font-mono text-caption-2 uppercase tracking-wide"
                    style={{ color: "var(--accent)" }}
                  >
                    0{i + 1}&nbsp;&nbsp;{t.name}
                  </p>
                  <Body className="mt-1">{t.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 5 - THE CHALLENGE (problem) */}
        <Section id="problem">
          <Reveal>
            <Label>the challenge</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">We launched education-first. The graph flatlined.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Carousels and infographics taught well and traveled nowhere. People didn&rsquo;t want to be informed. They wanted to be moved.
            </Body>
          </Reveal>

          {/* The planning behind the educational set: three notebook
             storyboards (moved here from pivot) - showing how much
             intentionality went into work that ultimately didn't travel. */}
          <Reveal delay={140} className="mt-16">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              from sketch to post
            </p>
            <p
              className="mt-3 font-heading text-text"
              style={{ fontSize: "clamp(1.2rem, 2vw, 1.5rem)", lineHeight: 1.35 }}
            >
              Every post started in a notebook.
            </p>
          </Reveal>
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {SKETCHES.map((s, i) => (
              <Reveal
                key={s.file}
                delay={i * 80}
                variant={i === 0 ? "left" : i === 2 ? "right" : "up"}
              >
                <div
                  className="relative w-full overflow-hidden border border-border aspect-[4/5]"
                  style={{ backgroundColor: "#F4ECD8" }}
                  data-cursor-label={s.cursor}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/${s.file}`}
                    alt="Instagram post storyboard sketch"
                    className="absolute inset-0 h-full w-full object-contain p-4"
                  />
                </div>
              </Reveal>
            ))}
          </div>

          {/* The 7 educational IG posts as a pinned horizontal-scroll sweep
             (moved here from pivot). These ARE the work that didn't travel:
             beautifully designed, strategically planned, never shared. The
             pinned sweep makes them feel like a deck the reader is paging
             through. Full-bleed via margin trick (NOT transform - transforms
             on ancestors break GSAP's position:fixed pinning). */}
          <div
            className="relative mt-16"
            style={{ width: "100vw", left: "50%", marginLeft: "-50vw" }}
          >
            <PinnedPostsSweep />
          </div>
        </Section>

        {/* 5 - INSIGHTS */}
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
                {/* Layout was justify-between, which pushed the title+body
                   block to the bottom - making title position vary per card
                   based on body length. Now: number top, title second, body
                   grows downward. All titles align across the 3 cards. */}
                <div
                  className="flex h-full flex-col gap-6 p-8"
                  style={{ backgroundColor: c.bg, color: c.fg }}
                >
                  <span className="font-display" style={{ fontSize: "2.25rem", fontWeight: 700, lineHeight: 1, opacity: 0.5 }}>
                    0{i + 1}
                  </span>
                  <p className="font-heading leading-snug" style={{ fontSize: "clamp(1.3rem, 1.9vw, 1.6rem)" }}>
                    {c.text}
                  </p>
                  <p
                    className="font-body leading-snug"
                    style={{ fontSize: "0.95rem", lineHeight: 1.45, opacity: 0.88 }}
                  >
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 6 - THE PIVOT AND ADAPT */}
        <Section id="pivot">
          <Reveal>
            <Label>the pivot and adapt</Label>
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
          {/* Five things we changed - tabbed reveal pattern. The 5 tabs
             across the top double as overview (you scan the numbers + names
             at a glance); clicking any expands its detail in a big panel
             below. Keyboard nav (Arrow Left/Right) works once a tab has
             focus. See `WhatWeChangedTabs` for the full component. */}
          <Reveal delay={120} className="mt-10">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              what we changed
            </p>
            <h3
              className="mt-3 font-heading leading-tight text-text"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
            >
              Five shifts. Click through.
            </h3>
          </Reveal>
          <WhatWeChangedTabs />

          {/* The mark in motion - now the viral reel alone. The 4 system
             templates (Grow/Cook/Craft/Learn) moved to reflection so they
             read as artifacts, not active competitors with the one reel
             that did the work. Side-by-side layout: video left, story
             right (eyebrow + headline + metrics chips). */}
          <Reveal delay={80} className="mt-16">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              the mark in motion
            </p>
            <h3
              className="mt-3 font-heading leading-tight text-text"
              style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)" }}
            >
              One reel did the rest.
            </h3>
          </Reveal>

          {/* Hero video laid out as a magazine feature: phone-shape on the
             left, supporting prose + metrics on the right at the same
             height. Plays muted on loop with playsInline so autoplay
             survives on mobile. preload='metadata' keeps the 5.7MB out of
             the initial bundle until the section is near the viewport. */}
          <Reveal delay={120} className="mt-8" variant="scale">
            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-14">
              <div className="mx-auto w-full md:mx-0" style={{ maxWidth: "min(420px, 80vw)" }}>
                <div
                  className="relative overflow-hidden border border-border"
                  style={{ aspectRatio: "9 / 16", backgroundColor: "var(--bg)" }}
                  data-cursor-label="the reel that broke through"
                >
                  <video
                    src="/handmade-homestead/eco-print-reel.mp4"
                    poster="/handmade-homestead/reel-grow.png"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="Eco-print reel: wear your garden fashionably"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">
                  the reel that broke through
                </p>
                <h4
                  className="mt-3 font-heading leading-tight text-text"
                  style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.01em" }}
                >
                  Wear your garden fashionably.
                </h4>
                <Body className="mt-4">
                  Roses pressed into denim, in real-time. No infographic could compete. The reel that turned scrollers into sharers.
                </Body>
                {/* Metrics as chips below the prose - the social proof at
                    a glance, no chart needed. Mobile-tuned: smaller font min
                    + tighter padding/gap so 3 chips fit cleanly at 320px
                    (iPhone SE) without overflowing on "4,598". */}
                <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { value: "22.2K", label: "Likes" },
                    { value: "260", label: "Saves" },
                    { value: "4,598", label: "Shares" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="border border-border px-3 py-3 sm:px-4"
                      style={{ backgroundColor: "var(--bg)" }}
                    >
                      <p
                        className="font-display leading-none text-text"
                        style={{ fontSize: "clamp(1.05rem, 4vw, 1.7rem)", fontWeight: 700 }}
                      >
                        {m.value}
                      </p>
                      <p className="mt-1.5 font-mono text-caption-2 uppercase tracking-wide text-muted">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* 7 - OUTCOMES */}
        <Section id="outcome">
          <Reveal>
            <Label>outcomes</Label>
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

        {/* 8 - REFLECTION / CLOSE
             Three nested blocks:
               1. Takeaways - 3 numbered insights from the project (full width)
               2. If we had more time - 3 next-step ambitions (full width)
               3. Closing poem + taglines + sign-off (centered, max-w-2xl) */}
        <Section id="reflection" className="py-28 md:py-40">
          <Reveal variant="fade">
            <Label>reflection</Label>
          </Reveal>

          {/* The 4 brand-pillar reels (moved here from pivot). In
             reflection they read as artifacts of the system we built -
             Grow / Cook / Craft / Learn - the templates that the brand
             will keep using. 4-across on desktop, 2-across on mobile. */}
          <Reveal delay={80} className="mt-10">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              the system we leave behind
            </p>
            <h3
              className="mt-3 font-heading leading-tight text-text"
              style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)" }}
            >
              Four pillars, one window.
            </h3>
          </Reveal>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
            {REELS.map((r, i) => (
              <Reveal key={r.file} delay={i * 70} variant="up">
                <Figure
                  src={`/${r.file}`}
                  file={r.file}
                  label={r.label}
                  aspect="aspect-[9/16]"
                  cursorLabel={r.cursor}
                />
              </Reveal>
            ))}
          </div>

          {/* Takeaways - the lessons. 3 numbered cards reading like a
             chapter break before the closing. */}
          <Reveal className="mt-20">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              takeaways
            </p>
            <h3
              className="mt-3 font-heading leading-tight text-text"
              style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)" }}
            >
              Through this journey.
            </h3>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
            {TAKEAWAYS.map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 80}
                variant={i === 0 ? "left" : i === 2 ? "right" : "up"}
              >
                <div
                  className="flex h-full flex-col gap-3 border border-border p-6 sm:p-7"
                  style={{ backgroundColor: "var(--bg)" }}
                >
                  <span
                    className="font-display"
                    style={{ color: "var(--accent)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1, opacity: 0.7 }}
                  >
                    0{i + 1}
                  </span>
                  <p
                    className="font-heading leading-snug text-text"
                    style={{ fontSize: "clamp(1.1rem, 1.7vw, 1.3rem)" }}
                  >
                    {t.name}
                  </p>
                  <Body className="mt-1">{t.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>

          {/* If we had more time - the unfinished ambitions. Lighter weight,
             a row of 3 with a soft eyebrow. */}
          <Reveal className="mt-20">
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              if we had more time
            </p>
            <h3
              className="mt-3 font-heading leading-tight text-text"
              style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)" }}
            >
              Where we&rsquo;d push next.
            </h3>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
            {NEXT_STEPS.map((s, i) => (
              <Reveal key={s} delay={i * 80} variant="up">
                <div
                  className="flex h-full items-start gap-3 border-l-2 py-2 pl-4"
                  style={{ borderColor: "var(--accent)" }}
                >
                  <span
                    className="font-mono text-caption-2 uppercase tracking-wide pt-0.5"
                    style={{ color: "var(--accent)", opacity: 0.7 }}
                  >
                    0{i + 1}
                  </span>
                  <p className="font-body text-text" style={{ fontSize: "1rem", lineHeight: 1.45 }}>
                    {s}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Closing - the poem, the taglines, the sign-off. Left-aligned
             to the section width so this final beat sits in the same column
             as the rest of the page (was centered in a narrow max-w-2xl,
             now aligned with the section's editorial column). */}
          <div className="mt-24">
            <Reveal variant="fade" delay={120}>
              <p
                className="font-heading leading-[1.5] text-text"
                style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.8rem)" }}
              >
                A brand is a feeling before it&rsquo;s a logo. The moment we stopped explaining slow living and started showing it, people leaned in, shared it, and stayed.
              </p>
            </Reveal>
            <Reveal variant="fade" delay={200}>
              <div className="mt-12 flex flex-col items-start gap-3">
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
              <p className="mt-12 font-mono text-caption-1 uppercase tracking-wide text-muted">
                Made with soil under our nails, and a lot of love.
              </p>
            </Reveal>
          </div>
        </Section>
      </div>
    </div>
  );
}
