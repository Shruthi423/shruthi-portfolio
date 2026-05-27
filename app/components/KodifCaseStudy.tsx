"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { gsap, useGSAP } from "../lib/gsap";

/**
 * Kodif case study - same editorial template, tuned for a brand + growth-design
 * story: a brand-product gap, the challenges, a wall of growth collateral, the
 * design principles, and the impact. Accent is a Kodif magenta (the product's
 * own brand is black + orange/pink/yellow). Images live in /public/kodif/.
 */

const ACCENT_LIGHT = "#C81E7E"; // Kodif magenta - readable on morning mist
const ACCENT_DARK = "#F06CB8"; // lighter pink - readable on warm midnight

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "why", label: "why a redesign" },
  { id: "challenges", label: "the challenges" },
  { id: "work", label: "the work" },
  { id: "principles", label: "principles" },
  { id: "outcome", label: "the outcome" },
  { id: "reflection", label: "reflection" },
] as const;

const META = [
  { label: "Role", value: "Product Designer (Intern)" },
  { label: "Mentor", value: "Marcos Moreira, Lead Product Designer" },
  { label: "Team", value: "Growth & Product Design" },
  { label: "When", value: "Summer 2025 · Palo Alto, CA" },
];

const CHALLENGES = [
  {
    title: "A brand behind its product",
    body: "Kodif had quietly specialized into e-commerce AI, but the website still told a generic SaaS story. The job was closing that gap.",
  },
  {
    title: "Integrations no one could find",
    body: "Enterprise clients struggled to discover and set up third-party connections. Setup had to get out of its own way.",
  },
  {
    title: "Growth needed assets",
    body: "Sales and events needed collateral that read as one brand: one-pagers, emailers, and conference giveaways.",
  },
];

const CLIENTS = ["JustFoodForDogs", "Dollar Shave Club", "Liquid IV", "Million Dollar Baby", "Good Eggs", "Fellow", "Aura", "Vegamour"];
const BENCHMARKED = ["Siena CX", "Decagon", "Rep AI", "Forethought AI"];

const GALLERY = [
  { file: "kodif/cover.jpg", label: "One-pager cover", cursor: "AI teammates" },
  { file: "kodif/strategy.jpg", label: "Strategy funnel", cursor: "discovery → retention" },
  { file: "kodif/ai-stack.jpg", label: "End-to-end AI stack", cursor: "concierge → manager" },
  { file: "kodif/why.jpg", label: "Why Kodif", cursor: "vs the field" },
  { file: "kodif/partners.jpg", label: "Partners & proof", cursor: "the logos" },
  { file: "kodif/event.jpg", label: "Leadership dinner", cursor: "Beverly Hills + NYC" },
];

const PRINCIPLES = [
  { title: "Brand clarity", body: "Say what Kodif is, built for e-commerce, in a single read." },
  { title: "Integration discoverability", body: "Make connecting tools obvious, not a hunt." },
  { title: "E-commerce storytelling", body: "Frame the product around the shopper journey, not features." },
  { title: "Growth-driven design", body: "Design assets that move pipeline, not just please the eye." },
  { title: "Visual consistency", body: "One system across web, email, and print." },
];

const METRICS = [
  { prefix: "", value: 30, decimals: 0, suffix: "%", label: "less onboarding friction" },
  { prefix: "", value: 3, decimals: 0, suffix: "×", label: "more referral sign-ups" },
  { prefix: "", value: 20, decimals: 0, suffix: "+", label: "DTC brands powered" },
];

const SECONDARY_STATS = [
  { value: "more demos", label: "from target accounts after events" },
  { value: "2 events", label: "Beverly Hills + NYC leadership dinners" },
  { value: "5", label: "design principles, one system" },
];

const REFLECTIONS = [
  {
    title: "Ask why, not just how",
    body: "Working under a designer who questioned every decision taught me to justify why something should exist, not only how it looks.",
  },
  {
    title: "Design that's aligned, not just pretty",
    body: "Every asset had to be visually cohesive and tied to a growth goal. Decoration without a job got cut.",
  },
  {
    title: "Purpose is the differentiator",
    body: "As AI interfaces become commodities, the edge belongs to designers who ask deeper questions about value and impact.",
  },
];

// ---------------------------------------------------------------- helpers

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg width="58" height="6" viewBox="0 0 58 6" fill="none" className={className} aria-hidden>
      <path d="M1 3.6C9 1.4 16 1.4 24 3.4S42 5.8 50 3.2 56 2.2 57 3.2" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-caption-1 lowercase tracking-[0.04em]" style={{ color: "var(--accent)" }}>{children}</p>
      <Squiggle className="mt-1.5" />
    </div>
  );
}

function Statement({ children, className = "", maxW = "30ch" }: { children: React.ReactNode; className?: string; maxW?: string }) {
  return (
    <h2 className={`font-heading leading-[1.1] text-text ${className}`} style={{ maxWidth: maxW, fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.01em" }}>
      {children}
    </h2>
  );
}

function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`max-w-[60ch] font-body leading-relaxed text-muted ${className}`} style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)" }}>
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="border border-border px-3 py-1 font-mono text-caption-2 uppercase tracking-wide text-muted">{children}</span>;
}

function Figure({
  src,
  alt,
  label,
  file,
  aspect = "aspect-video",
  position = "center",
  cursorLabel,
  className = "",
  parallax = true,
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
        { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: frameRef.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { dependencies: [showImage, parallax], scope: frameRef },
  );

  if (showImage) {
    return (
      <div ref={frameRef} className={`relative w-full overflow-hidden ${aspect} ${className}`} data-cursor-label={cursorLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={src} alt={alt ?? label} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} onError={() => setErrored(true)} />
      </div>
    );
  }

  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed bg-surface/50 px-4 ${aspect} ${className}`}
      style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
      aria-label={label}
      data-cursor-label={cursorLabel}
    >
      <span className="max-w-[85%] text-center font-mono text-caption-1 uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--accent) 75%, var(--color-muted))" }}>{label}</span>
      <span className="font-mono text-caption-2 lowercase tracking-wide text-muted/70">{file}</span>
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
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1400,
}: {
  value: number;
  prefix?: string;
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
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------- chrome

function SectionRail({ active, onJump }: { active: string; onJump: (id: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <nav aria-label="Sections" className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3.5 md:flex">
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
      <div className="h-full transition-[width] duration-100 ease-out" style={{ width: `${p}%`, backgroundColor: "var(--accent)" }} />
    </div>
  );
}

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 px-6 py-12 sm:px-10 md:py-20 lg:pl-32 lg:pr-12 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------- page

export function KodifCaseStudy() {
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
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="relative" style={{ backgroundColor: "var(--bg)", ["--accent"]: accent } as React.CSSProperties}>
      <GrainOverlay />
      <SectionRail active={active} onJump={jump} />
      <ProgressBar />

      <div className="relative z-10">
        {/* 1 - OVERVIEW */}
        <section id="overview" className="scroll-mt-24 px-6 pb-8 pt-28 sm:px-10 md:pt-32 lg:pl-32 lg:pr-12">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h1 className="font-display leading-[1.02] text-text" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Shaping an AI concierge for e-commerce.
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 max-w-[52ch] font-heading italic text-muted" style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)" }}>
                Kodif&rsquo;s product had outgrown its brand. I redesigned the website and built the growth assets to close the gap.
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

            {/* hero: the one-pager, in two colourways */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6">
              <Reveal delay={200} variant="left">
                <Figure src="/kodif/onepager-orange.jpg" file="kodif/onepager-orange.jpg" label="One-pager, orange" aspect="aspect-[3/4]" cursorLabel="the deliverable" parallax={false} className="border border-border" />
              </Reveal>
              <Reveal delay={260} variant="right">
                <Figure src="/kodif/onepager-pink.jpg" file="kodif/onepager-pink.jpg" label="One-pager, pink" aspect="aspect-[3/4]" cursorLabel="and a colourway" parallax={false} className="border border-border" />
              </Reveal>
            </div>

            <Reveal delay={120}>
              <p className="mt-12 max-w-[22ch] font-heading leading-[1.12] text-text" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)", letterSpacing: "-0.01em" }}>
                The product had evolved <span className="italic" style={{ color: "var(--accent)" }}>faster</span> than the brand.
              </p>
            </Reveal>
          </div>
        </section>

        {/* 2 - WHY A REDESIGN */}
        <Section id="why">
          <Reveal>
            <Label>why a redesign</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Not broken flows. A story that had fallen out of step.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Kodif had become deeply specialized for e-commerce while the website still told a broad SaaS story. This wasn&rsquo;t a repair job. It was about elevating Kodif&rsquo;s story, sharpening the brand, and opening new ways for customers to engage.
            </Body>
          </Reveal>
        </Section>

        {/* 3 - THE CHALLENGES */}
        <Section id="challenges">
          <Reveal>
            <Label>the challenges</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Three gaps to close at once.</Statement>
          </Reveal>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-3">
            {CHALLENGES.map((c, i) => (
              <Reveal key={c.title} delay={i * 80} className="h-full">
                <div className="flex h-full flex-col gap-4 p-8" style={{ backgroundColor: "var(--bg)" }}>
                  <span className="font-display" style={{ color: "var(--accent)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>0{i + 1}</span>
                  <h3 className="font-heading text-h4 leading-snug text-text">{c.title}</h3>
                  <Body className="!max-w-none">{c.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 4 - THE WORK */}
        <Section id="work">
          <Reveal>
            <Label>the work</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">One brand, from landing page to tote bag.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              I realigned the landing page to the AI-concierge story, rebuilt the integrations flow to cut setup friction, and produced the growth system: one-pagers, event emailers, and conference collateral, benchmarked against the field and built with the growth team.
            </Body>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="font-mono text-caption-2 uppercase tracking-wide text-muted">benchmarked against</span>
              {BENCHMARKED.map((b) => (
                <Pill key={b}>{b}</Pill>
              ))}
            </div>
          </Reveal>

          {/* collateral wall */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {GALLERY.map((g, i) => (
              <Reveal key={g.file} delay={(i % 3) * 70}>
                <div>
                  <Figure src={`/${g.file}`} file={g.file} label={g.label} aspect="aspect-[3/4]" cursorLabel={g.cursor} parallax={false} className="border border-border" />
                  <p className="mt-2 font-mono text-caption-2 uppercase tracking-wide text-muted">{g.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <p className="mt-10 font-body text-caption-1 text-muted">
              Client communication designs shipped for{" "}
              <span className="text-text">{CLIENTS.join(", ")}</span>.
            </p>
          </Reveal>
        </Section>

        {/* 5 - PRINCIPLES */}
        <Section id="principles">
          <Reveal>
            <Label>principles</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Five rules kept it one system.</Statement>
          </Reveal>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 70} className="h-full">
                <div className="flex h-full flex-col gap-3 p-7" style={{ backgroundColor: "var(--bg)" }}>
                  <span className="font-display" style={{ color: "var(--accent)", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>0{i + 1}</span>
                  <h3 className="font-heading text-h4 leading-snug text-text">{p.title}</h3>
                  <Body className="!max-w-none">{p.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 6 - THE OUTCOME */}
        <Section id="outcome">
          <Reveal>
            <Label>the outcome</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">The narrative caught up, and so did the numbers.</Statement>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <div className="border border-border p-8" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="font-display" style={{ color: "var(--accent)", fontSize: "clamp(2.75rem, 6vw, 4.5rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />
                  </p>
                  <Body className="mt-2">{m.label}</Body>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100}>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {SECONDARY_STATS.map((s) => (
                <div key={s.label} className="border border-border px-5 py-4" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="font-heading text-h4 leading-none text-text">{s.value}</p>
                  <p className="mt-1.5 font-body text-caption-1 text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>

        {/* 7 - REFLECTION */}
        <Section id="reflection">
          <Reveal>
            <Label>reflection</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">What I&rsquo;d carry into the next one.</Statement>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {REFLECTIONS.map((r, i) => (
              <Reveal key={r.title} delay={i * 80}>
                <div className="h-full border border-border p-7" style={{ backgroundColor: "var(--bg)" }}>
                  <h3 className="font-heading text-h4 leading-snug text-text">{r.title}</h3>
                  <Body className="mt-3 !max-w-none">{r.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal variant="fade" delay={140} className="mt-16">
            <p className="mx-auto max-w-2xl text-center font-heading leading-[1.5] text-text" style={{ fontSize: "clamp(1.2rem, 2vw, 1.6rem)" }}>
              Ask why something should exist, not just how it should look. That question is the whole job.
            </p>
          </Reveal>
        </Section>
      </div>
    </div>
  );
}
