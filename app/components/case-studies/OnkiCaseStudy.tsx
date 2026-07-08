"use client";
/* eslint-disable @next/next/no-img-element -- case-study screens are optimized PNGs in /public, not gallery photos */

import { useEffect, useRef, useState } from "react";
import { Rock_Salt } from "next/font/google";
import { useTheme } from "@/app/components/shared/ThemeProvider";

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

// Handwritten asides - DRAFTS in Shruthi's voice. Swap for your real ones.
const NOTES = {
  context: "this was me at every grocery store, honestly.",
  design: "every choice had a “why”. these are mine →",
  outcome: "still can't believe this actually shipped.",
};

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "context", label: "context" },
  { id: "insights", label: "insights" },
  { id: "problem", label: "problem" },
  { id: "design", label: "design" },
  { id: "outcome", label: "outcome" },
  { id: "reflection", label: "reflection" },
] as const;

const OVERVIEW_TAGS = [
  "Conversational AI",
  "Multimodal UX",
  "Retail Design",
  "Voice UX",
  "Interaction Design",
];

const META: { label: string; value: string; href?: string }[] = [
  { label: "Company", value: "Onki AI, NYC" },
  { label: "Role", value: "UI/UX Design Intern" },
  { label: "Duration", value: "Apr – Jun 2024" },
  { label: "Tools", value: "Figma, FigJam" },
  { label: "Live", value: "onki.ai", href: "https://onki.ai/" },
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
    src: "/onki/screen-greeting.png",
    label: "Screen: Welcome / greeting",
    caption: "The kiosk greets every shopper who walks by.",
    cursor: "the hello",
    tilt: -3,
  },
  {
    src: "/onki/screen-preference.png",
    label: "Screen: Preference input",
    caption: "Simple questions, one at a time.",
    cursor: "one question at a time",
    tilt: 2.5,
  },
  {
    src: "/onki/screen-recommendations.png",
    label: "Screen: Recommendation cards",
    caption: "3 curated options, like a sommelier's pick.",
    cursor: "the magic three",
    tilt: -2,
  },
  {
    src: "/onki/screen-detail.png",
    label: "Screen: Wine detail",
    caption: "Tasting notes, pairings, winery origin.",
    cursor: "the nerdy details",
    tilt: 3,
  },
  {
    src: "/onki/screen-location.png",
    label: "Screen: Find this wine",
    caption: "Aisle and shelf, or text it to yourself. The loop closes.",
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
        className="font-mono text-caption-1 uppercase tracking-wide"
        style={{ color: "var(--accent)" }}
      >
        {children}
      </p>
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
    <span className="border border-border px-3 py-1 font-mono text-caption-2 uppercase tracking-wide text-muted">
      {children}
    </span>
  );
}

// Real image in an aspect frame, with a branded dashed placeholder as a
// fallback when the src is missing or fails. fit="contain" centers tall or
// off-ratio art on a surface; default "cover" fills the frame.
function Figure({
  src,
  label,
  aspect = "aspect-[16/9]",
  position = "center",
  cursorLabel,
  className = "",
  fit = "cover",
}: {
  src?: string;
  label: string;
  aspect?: string;
  position?: string;
  cursorLabel?: string;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const [errored, setErrored] = useState(false);
  if (src && !errored) {
    return (
      <div
        className={`relative w-full overflow-hidden ${aspect} ${className}`}
        data-cursor-label={cursorLabel}
      >
        <img
          src={src}
          alt={label}
          className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
          style={{ objectPosition: position }}
          onError={() => setErrored(true)}
        />
      </div>
    );
  }
  return (
    <div
      className={`flex w-full flex-col items-center justify-center border-2 border-dashed bg-surface/50 px-4 ${aspect} ${className}`}
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

// Mirrors Feeld's Section: one shared editorial column (max-w-6xl), uniform
// px/py rhythm so Onki sits in the same family as the other case studies.
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
    <section
      id={id}
      className={`scroll-mt-24 px-6 py-14 sm:px-10 md:py-20 lg:px-20 xl:px-24 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
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
        {/* 1 - OVERVIEW — single editorial column, title leads (matches Feeld). */}
        <SectionWrap id="overview" className="pt-28 md:pt-32">
          <Reveal>
            <h1
              className="text-left font-display leading-[1.05] text-text"
              style={{ fontSize: "clamp(2.25rem, 4vw, 3.75rem)", fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              Designing an AI sommelier for the wine aisle.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <Body className="mt-6">
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
            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-border py-7 sm:grid-cols-3 md:grid-cols-5">
              {META.map((m) => (
                <div key={m.label}>
                  <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">
                    {m.label}
                  </dt>
                  <dd className="mt-1 font-body text-body text-text">
                    {m.href ? (
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
          <Reveal delay={150} variant="scale" className="mt-14">
            <Figure
              src="/onki/hero.png"
              label="AiCap greeting screen"
              aspect="aspect-[16/9]"
              fit="contain"
              cursorLabel="say hi to AiCap"
              className="border border-border bg-surface/40"
            />
          </Reveal>
        </SectionWrap>

        {/* 2 - CONTEXT */}
        <SectionWrap id="context">
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
            <div className="mx-auto max-w-xl">
              <Figure
                src="/onki/context-sketch.png"
                label="Storyboard: the overwhelmed-shopper journey"
                aspect="aspect-square"
                cursorLabel="the overwhelm"
                className="border border-border"
              />
            </div>
          </Reveal>
        </SectionWrap>

        {/* 3 - INSIGHTS */}
        <SectionWrap id="insights">
          <Reveal>
            <Eyebrow>Key insights</Eyebrow>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {INSIGHTS.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <div
                  className="h-full border border-border p-8"
                  style={{ backgroundColor: "var(--bg)" }}
                >
                  <h3 className="font-heading text-h4 leading-snug text-text">{c.title}</h3>
                  <Body className="mt-3">{c.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </SectionWrap>

        {/* 4 - PROBLEM */}
        <SectionWrap id="problem">
          <Reveal>
            <Statement className="max-w-3xl">
              Today&rsquo;s retail shelves are passive. AICap makes them talk back.
            </Statement>
          </Reveal>
          <Reveal delay={100}>
            <Body className="mt-6 max-w-2xl">
              Static labels and understaffed stores can&rsquo;t deliver
              personalized guidance at scale. We designed the experience that
              bridges that gap, from first greeting to the right bottle.
            </Body>
          </Reveal>
          <div className="mt-12 grid items-start gap-6 sm:grid-cols-2">
            <Reveal>
              <Figure
                src="/onki/before-sarah.png"
                label="Before: the earlier in-store assistant"
                aspect="aspect-[3/4]"
                fit="contain"
                cursorLabel="before"
                className="border border-border bg-surface/40"
              />
              <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">before</p>
            </Reveal>
            <Reveal delay={80}>
              <Figure
                src="/onki/after-aicap.png"
                label="After: the AiCap redesign"
                aspect="aspect-[3/4]"
                fit="contain"
                cursorLabel="after"
                className="border border-border bg-surface/40"
              />
              <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">after</p>
            </Reveal>
          </div>
        </SectionWrap>

        {/* 5 - DESIGN DECISIONS */}
        <SectionWrap id="design">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.45fr]">
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
                  <div className="border border-border bg-surface p-8">
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

          {/* Information architecture — the full conversation flow, full-width. */}
          <Reveal variant="scale" className="mt-14">
            <Figure
              src="/onki/ia.png"
              label="Information architecture: the full conversation flow"
              aspect="aspect-[16/9]"
              fit="contain"
              cursorLabel="the whole flow"
              className="border border-border bg-surface/40"
            />
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">
              information architecture
            </p>
          </Reveal>
        </SectionWrap>

        {/* 6 - OUTCOME */}
        <SectionWrap id="outcome">
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
                  className="h-full border border-border p-8"
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
          {/* What shipped — the journey storyboard, then every screen visible. */}
          <Reveal className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">
              the screens, end to end
            </p>
          </Reveal>
          <Reveal variant="scale" delay={80} className="mt-5">
            <Figure
              src="/onki/storyboard.png"
              label="The shopper journey, greeting to bottle"
              aspect="aspect-[3/2]"
              cursorLabel="the whole journey"
              className="border border-border"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {SCREENS.map((s, i) => (
              <Reveal key={s.src} delay={i * 60}>
                <div>
                  <Figure
                    src={s.src}
                    label={s.label}
                    aspect="aspect-[9/16]"
                    cursorLabel={s.cursor}
                    className="border border-border"
                  />
                  <p className="mt-2 font-mono text-caption-2 uppercase tracking-wide text-muted">
                    {s.label.replace("Screen: ", "")}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </SectionWrap>

        {/* 8 - REFLECTION — left-aligned Label + Body + sign-off, matching Feeld. */}
        <SectionWrap id="reflection">
          <Reveal variant="fade">
            <Eyebrow>Reflection</Eyebrow>
          </Reveal>
          <Reveal variant="fade" delay={120}>
            <Body className="mt-10">
              Designing for conversational AI taught me that the hardest decisions
              aren&rsquo;t visual, they&rsquo;re behavioral. What does the AI say
              when a user hesitates? How do you make a stranger comfortable talking
              to a kiosk in public? How do you reduce cognitive load without making
              the experience feel patronizing? This project shaped how I think about
              human-AI interaction: not as a feature to design around, but as a
              relationship to design for.
            </Body>
          </Reveal>
        </SectionWrap>
      </div>
    </div>
  );
}
