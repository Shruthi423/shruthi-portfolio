"use client";

import { useEffect, useRef, useState } from "react";
import { Rock_Salt } from "next/font/google";
import { useTheme } from "./ThemeProvider";

/**
 * Onki / AICap case study - now wearing the site's personality.
 *
 * The "case-study kit" (reusable for every future project): a per-project
 * config block (accent color + handwritten notes) drives a set of branded
 * pieces - a paw-print section nav, Rock Salt margin asides, polaroid screen
 * frames, a frosted grain wash, witty cursor labels, and the project's own
 * colour threaded through eyebrows / nav / metrics. Drop a new config + content
 * and the next case study inherits all of it.
 */

// Rock Salt - the handwriting (same as the About polaroids).
const rockSalt = Rock_Salt({ weight: "400", subsets: ["latin"], display: "swap" });

// ---------------------------------------------------------------- project config

// Onki's signature colour (from its /work card), split light/dark for contrast.
const ACCENT_LIGHT = "#A67C20"; // amber - readable on morning mist
const ACCENT_DARK = "#FCB34F"; // lighter amber - readable on warm midnight
const INK = "#3b2a1c"; // espresso - handwriting on the white polaroids

// Handwritten asides - DRAFTS in Shruthi's voice. Swap for your real ones.
const NOTES = {
  context: "this was me at every grocery store, honestly.",
  design: "every choice had a “why”. these are mine →",
  outcome: "still can't believe this actually shipped.",
};

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "context", label: "Context" },
  { id: "insights", label: "Insights" },
  { id: "problem", label: "Problem" },
  { id: "design", label: "Design" },
  { id: "screens", label: "Screens" },
  { id: "outcome", label: "Outcome" },
  { id: "reflection", label: "Reflection" },
] as const;

const OVERVIEW_TAGS = [
  "Conversational AI",
  "Multimodal UX",
  "Retail Design",
  "Voice UX",
  "Interaction Design",
];

const META = [
  { label: "Company", value: "Onki AI, NYC" },
  { label: "Role", value: "UI/UX Design Intern" },
  { label: "Duration", value: "Apr – Jun 2024" },
  { label: "Tools", value: "Figma, FigJam" },
];

const INSIGHTS = [
  {
    title: "Shoppers want confidence, not expertise.",
    body: "Nobody wants to become a wine expert in the aisle. They just want to feel good about their choice.",
  },
  {
    title: "Too many options is the real problem.",
    body: "Choice overload, not lack of information, is what kills purchase confidence at the shelf.",
  },
  {
    title: "Trust is the first conversion.",
    body: "If a shopper doesn't feel comfortable with the AI, they walk away before the recommendation even happens.",
  },
];

const DESIGN = [
  {
    title: "Voice + touch: both, not either",
    body: "Some shoppers carry baskets. Some feel self-conscious talking to a screen in public. We designed every interaction to work through both modalities, rooted in inclusive design and redundant interaction pathways.",
    tag: "Inclusive Design",
  },
  {
    title: "Always 3 recommendations, not more",
    body: "Hick's Law: more options = longer decisions. In an aisle of hundreds, 3 curated choices reduce cognitive load and feel like a sommelier's pick, not another shelf.",
    tag: "Cognitive Load",
  },
  {
    title: "Questions ordered by difficulty",
    body: "Type → price → flavor → pairing. Everyone knows red vs white. Far fewer know their tannin preference. Starting simple builds momentum and mirrors how a good sommelier talks to a customer.",
    tag: "Progressive Disclosure",
  },
  {
    title: "Conversational tone, not transactional",
    body: "AICap proactively greets strangers in public. A robotic tone creates resistance. Warm language lowers the psychological barrier before the recommendation happens.",
    tag: "Emotional Design",
  },
  {
    title: "Save / Text me / Item location",
    body: "A recommendation alone doesn't close the loop. These three features address distinct post-decision drop-off moments: finding the bottle, not ready to buy, or revisiting the choice later.",
    tag: "Micro-interaction Design",
  },
];

const SCREENS = [
  {
    label: "Screen: Welcome / greeting",
    caption: "The kiosk greets every shopper who walks by.",
    cursor: "the hello",
    tilt: -3,
  },
  {
    label: "Screen: Preference input",
    caption: "Simple questions, one at a time.",
    cursor: "one question at a time",
    tilt: 2.5,
  },
  {
    label: "Screen: Recommendation cards",
    caption: "3 curated options, like a sommelier's pick.",
    cursor: "the magic three",
    tilt: -2,
  },
  {
    label: "Screen: Wine detail",
    caption: "Tasting notes, pairings, winery origin.",
    cursor: "the nerdy details",
    tilt: 3,
  },
  {
    label: "Screen: Save / Text me / Item location",
    caption: "Closing the loop between discovery and purchase.",
    cursor: "don't lose them",
    tilt: -2.5,
  },
];

const METRICS = [
  { value: 20, suffix: "%", label: "of wine shoppers interacted with AICap" },
  { value: 30, suffix: "%", label: "more spent by shoppers who engaged" },
  { value: 3, suffix: "", label: "interns drove all design decisions independently" },
];

// ---------------------------------------------------------------- helpers

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Hand-drawn squiggle underline (accent) - the hand-made touch under eyebrows.
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

// Hand-drawn arrow for the margin asides.
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p
        className="font-mono text-caption-1 uppercase tracking-[0.18em]"
        style={{ color: "var(--accent)" }}
      >
        {children}
      </p>
      <Squiggle className="mt-1.5" />
    </div>
  );
}

function Statement({
  children,
  center = false,
  className = "",
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <h2
      className={`font-heading leading-[1.12] text-text ${center ? "text-center" : ""} ${className}`}
      style={{ fontSize: "clamp(2rem, 3.6vw, 3.25rem)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h2>
  );
}

function Body({
  children,
  center = false,
  className = "",
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`font-body leading-relaxed text-muted ${center ? "text-center" : ""} ${className}`}
      style={{ fontSize: "clamp(1rem, 1.3vw, 1.15rem)" }}
    >
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-3 py-1 font-mono text-caption-2 uppercase tracking-wide text-muted">
      {children}
    </span>
  );
}

// Branded placeholder - amber-tinted dashed frame + a witty cursor label.
function ImagePlaceholder({
  label,
  ratio = "16 / 9",
  cursorLabel,
  className = "",
}: {
  label: string;
  ratio?: string;
  cursorLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded-2xl border-2 border-dashed bg-surface/50 ${className}`}
      style={{
        aspectRatio: ratio,
        borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
      }}
      aria-label={label}
      data-cursor-label={cursorLabel}
    >
      <span
        className="max-w-[80%] text-center font-mono text-caption-1 uppercase tracking-wide"
        style={{ color: "color-mix(in srgb, var(--accent) 75%, var(--color-muted))" }}
      >
        {label}
      </span>
    </div>
  );
}

// A screen rendered as a pinned polaroid (tape + tilt + Rock Salt caption).
function PolaroidScreen({
  label,
  caption,
  tilt,
  cursorLabel,
}: {
  label: string;
  caption: string;
  tilt: number;
  cursorLabel: string;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-3xl bg-white p-4 pb-12 shadow-[0_28px_60px_-18px_rgba(0,0,0,0.4)]"
      style={{ transform: `rotate(${tilt}deg)` }}
      data-cursor-label={cursorLabel}
    >
      {/* tape */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-[2px]"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
      />
      <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-[#ece8e0]">
        <span className="max-w-[80%] text-center font-mono text-caption-1 uppercase tracking-wide text-[#9b958a]">
          {label}
        </span>
      </div>
      <p
        className={`${rockSalt.className} mt-5 text-center text-[clamp(1rem,1.5vw,1.3rem)] leading-none`}
        style={{ color: INK }}
      >
        {caption}
      </p>
    </div>
  );
}

// Frosted grain wash - paper texture so the page isn't flat (matches the home).
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

// Fade / slide-in on scroll entry.
function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "up" | "fade" | "scale";
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
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const hidden =
    variant === "fade"
      ? "opacity-0"
      : variant === "scale"
        ? "opacity-0 scale-[0.97]"
        : "opacity-0 translate-y-8";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? "opacity-100 translate-y-0 scale-100" : hidden} ${className}`}
    >
      {children}
    </div>
  );
}

function CountUp({
  value,
  suffix = "",
  duration = 1400,
}: {
  value: number;
  suffix?: string;
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
          setN(Math.round(eased * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------- chrome

function DotNav({ active, onJump }: { active: string; onJump: (id: string) => void }) {
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

function SectionWrap({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 px-6 sm:px-10 lg:pl-32 lg:pr-12 ${className}`}>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------- page

export function OnkiCaseStudy() {
  const [active, setActive] = useState<string>("overview");
  const { resolvedTheme } = useTheme();
  const accent = resolvedTheme === "dark" ? ACCENT_DARK : ACCENT_LIGHT;

  // Active-section detection via a centre-of-viewport band (robust for tall
  // sections that never reach a 0.3 ratio).
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
      <DotNav active={active} onJump={jump} />
      <ProgressBar />

      <div className="relative z-10">
        {/* 1 - OVERVIEW */}
        <SectionWrap id="overview" className="pb-20 pt-28 md:pb-28 md:pt-36">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <h1
                  className="font-display leading-[1.05] text-text"
                  style={{ fontSize: "clamp(2.25rem, 4vw, 3.75rem)", fontWeight: 700, letterSpacing: "-0.02em" }}
                >
                  Designing an AI sommelier for the wine aisle.
                </h1>
              </Reveal>
              <Reveal delay={100}>
                <Body className="mt-6 max-w-xl">
                  AICap is a voice + touch retail kiosk that helps shoppers discover
                  wine through conversational AI, built by Onki, a NYC startup
                  founded by ex-Amazon innovators.
                </Body>
              </Reveal>
              <Reveal delay={200}>
                <div className="mt-7 flex flex-wrap gap-2">
                  {OVERVIEW_TAGS.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={300}>
                <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                  {META.map((m) => (
                    <div key={m.label}>
                      <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">
                        {m.label}
                      </dt>
                      <dd className="mt-1 font-body text-body text-text">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
            <Reveal delay={150}>
              <ImagePlaceholder
                label="Hero: AICap kiosk in retail environment"
                ratio="16 / 9"
                cursorLabel="say hi to AICap"
              />
            </Reveal>
          </div>
        </SectionWrap>

        {/* 2 - CONTEXT */}
        <SectionWrap id="context" className="py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <Statement className="max-w-3xl">
                Wine aisles have hundreds of choices and zero guidance.
              </Statement>
            </Reveal>
            <div className="flex items-end justify-between gap-6">
              <Reveal delay={100}>
                <Body className="mt-6 max-w-2xl">
                  Younger shoppers (low-to-medium wine knowledge) consistently
                  freeze at the shelf. Too many options, no personalization, no one
                  to ask.
                </Body>
              </Reveal>
              <Aside className="mb-1 shrink-0" rotate={-4}>
                {NOTES.context}
              </Aside>
            </div>
            <Reveal variant="scale" className="mt-12">
              <ImagePlaceholder
                label="Context: Overwhelmed shopper in wine aisle"
                ratio="21 / 9"
                cursorLabel="the wall of wine"
              />
            </Reveal>
          </div>
        </SectionWrap>

        {/* 3 - INSIGHTS (warm band) */}
        <SectionWrap id="insights" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>Key insights</Eyebrow>
            </Reveal>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {INSIGHTS.map((c, i) => (
                <Reveal key={c.title} delay={i * 80}>
                  <div
                    className="h-full rounded-2xl border border-border p-8"
                    style={{ backgroundColor: "var(--bg)" }}
                  >
                    <h3 className="font-heading text-h4 leading-snug text-text">{c.title}</h3>
                    <Body className="mt-3">{c.body}</Body>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </SectionWrap>

        {/* 4 - PROBLEM */}
        <SectionWrap id="problem" className="py-20 md:py-28">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <Statement center className="mx-auto max-w-3xl">
                Today&rsquo;s retail shelves are passive. AICap makes them talk back.
              </Statement>
            </Reveal>
            <Reveal delay={100}>
              <Body center className="mx-auto mt-6 max-w-[600px]">
                Static labels and understaffed stores can&rsquo;t deliver
                personalized guidance at scale. We designed the experience that
                bridges that gap, from first greeting to the right bottle.
              </Body>
            </Reveal>
            <Reveal className="mt-12">
              <ImagePlaceholder
                label="Problem: Static shelf label vs AICap screen (before/after)"
                ratio="16 / 9"
                cursorLabel="before / after"
              />
            </Reveal>
          </div>
        </SectionWrap>

        {/* 5 - DESIGN DECISIONS */}
        <SectionWrap id="design" className="py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.45fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow>Design decisions</Eyebrow>
              <Statement className="mt-4">The reasoning behind the work.</Statement>
              <Body className="mt-4">Every interaction had a UX principle behind it.</Body>
              <Aside className="mt-8" rotate={-2}>
                {NOTES.design}
              </Aside>
            </div>
            <div className="flex flex-col gap-6">
              {DESIGN.map((c) => (
                <Reveal key={c.title}>
                  <div className="rounded-2xl border border-border bg-surface p-8">
                    <h3 className="font-heading text-h4 leading-snug text-text">{c.title}</h3>
                    <Body className="mt-3">{c.body}</Body>
                    <div className="mt-5">
                      <Pill>{c.tag}</Pill>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </SectionWrap>

        {/* 6 - SCREENS (sticky polaroid stack) */}
        <SectionWrap id="screens" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>Key screens</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <Statement className="mt-4">End-to-end, across every touchpoint.</Statement>
            </Reveal>
          </div>
          <div className="relative mt-10">
            {SCREENS.map((s, i) => (
              <div
                key={s.label}
                className="sticky top-[10vh] flex h-[82vh] items-center justify-center"
                style={{ zIndex: i + 1 }}
              >
                <Reveal variant="scale" className="w-full">
                  <PolaroidScreen
                    label={s.label}
                    caption={s.caption}
                    tilt={s.tilt}
                    cursorLabel={s.cursor}
                  />
                </Reveal>
              </div>
            ))}
          </div>
        </SectionWrap>

        {/* 7 - OUTCOME (warm band) */}
        <SectionWrap id="outcome" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Statement>Designs shipped. Numbers followed.</Statement>
            </Reveal>
            <Reveal delay={100}>
              <Body className="mt-6 max-w-2xl">
                The designs contributed to AICap&rsquo;s real in-store deployment.
                Early retail data showed strong commercial impact.
              </Body>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {METRICS.map((m, i) => (
                <Reveal key={m.label} delay={i * 80}>
                  <div
                    className="h-full rounded-2xl border border-border p-8"
                    style={{ backgroundColor: "var(--bg)" }}
                    data-cursor-label={i === 1 ? "the one I'm proud of" : undefined}
                  >
                    <p
                      className="font-display"
                      style={{
                        color: "var(--accent)",
                        fontSize: "clamp(3rem, 7vw, 5.25rem)",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                      }}
                    >
                      <CountUp value={m.value} suffix={m.suffix} />
                    </p>
                    <Body className="mt-3">{m.label}</Body>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-8 flex items-start justify-between gap-6">
              <Reveal delay={120}>
                <p className="max-w-2xl font-body text-caption-2 leading-relaxed text-muted">
                  Post-deployment metrics from Onki&rsquo;s published retail data.
                  Deployment occurred after the internship concluded.
                </p>
              </Reveal>
              <Aside className="shrink-0" rotate={3}>
                {NOTES.outcome}
              </Aside>
            </div>
            <Reveal className="mt-12">
              <ImagePlaceholder
                label="Outcome: AICap deployed in-store"
                ratio="16 / 9"
                cursorLabel="it's real!"
              />
            </Reveal>
          </div>
        </SectionWrap>

        {/* 8 - REFLECTION */}
        <SectionWrap id="reflection" className="py-28 md:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal variant="fade">
              <div className="flex flex-col items-center">
                <Eyebrow>Reflection</Eyebrow>
              </div>
            </Reveal>
            <Reveal variant="fade" delay={120}>
              <p
                className="mt-8 font-heading leading-[1.6] text-text"
                style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)" }}
              >
                Designing for conversational AI taught me that the hardest decisions
                aren&rsquo;t visual, they&rsquo;re behavioral. What does the AI say
                when a user hesitates? How do you make a stranger comfortable talking
                to a kiosk in public? How do you reduce cognitive load without making
                the experience feel patronizing? This project shaped how I think about
                human-AI interaction: not as a feature to design around, but as a
                relationship to design for.
              </p>
            </Reveal>
            {/* Tagline sign-off — uppercase mono, accent-coloured, matches
               the pattern used in Feeld and Handmade Homestead. */}
            <Reveal variant="fade" delay={240}>
              <p
                className="mt-16 font-mono text-caption-1 uppercase tracking-wide"
                style={{ color: "var(--accent)" }}
              >
                A good assistant doesn&rsquo;t sell. It remembers.
              </p>
            </Reveal>
          </div>
        </SectionWrap>
      </div>
    </div>
  );
}
