"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { gsap, useGSAP } from "../lib/gsap";

/**
 * Temple case study - the same editorial template as Handmade Homestead
 * (left rail, lowercase labels, full-width square images, scroll motion),
 * tuned for a denser product story: an ownership breakdown, a 4-step flow,
 * a wall of user voices, and an honest "what didn't work" log. Accent is a
 * devotional saffron; the voice is measured (no handwritten asides).
 *
 * Images live in /public/temple/; each falls back to a labelled placeholder.
 */

// ---------------------------------------------------------------- project config

const ACCENT_LIGHT = "#BC6B12"; // deep saffron/marigold - readable on morning mist
const ACCENT_DARK = "#E6A24A"; // marigold glow - readable on warm midnight

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "context", label: "context" },
  { id: "problem", label: "the problem" },
  { id: "approach", label: "the approach" },
  { id: "solution", label: "the solution" },
  { id: "voices", label: "in their words" },
  { id: "iterations", label: "what didn't work" },
  { id: "outcome", label: "the outcome" },
  { id: "reflection", label: "reflection" },
] as const;

const META = [
  { label: "Role", value: "Associate Product Manager" },
  { label: "Team", value: "3 PMs, 2 UX, 3 Devs, 5 stakeholders" },
  { label: "Company", value: "9and9 · 2022–2023" },
  { label: "Live", value: "srisailadevasthanam.org", href: "https://srisailadevasthanam.org" },
];

const OWNED = ["Discovery & framing", "Stakeholder alignment", "Product decisions"];

const CHALLENGES = [
  {
    title: "Fraud & revenue loss",
    body: "Manual paper tickets created untraceable leakage. Fakes were easy, and impossible to audit.",
  },
  {
    title: "The thundering herd",
    body: "With no digital slotting, pilgrims arrived in waves. Overcrowding turned dangerous at peak.",
  },
  {
    title: "Offline-first or nothing",
    body: "2G and 3G at the temple site meant the flow had to hold up with almost no signal.",
  },
];

const FLOW = [
  { step: "01", title: "Choose date & service", body: "A traffic-light heatmap shows real-time slot availability at a glance.", file: "temple/flow-1.jpg", cursor: "available / filling / sold out" },
  { step: "02", title: "Enter details", body: "Basic info only, with auto-fill for returning pilgrims.", file: "temple/flow-2.jpg", cursor: "the short form" },
  { step: "03", title: "Review", body: "Dress code, rules, and visit details, confirmed before paying.", file: "temple/flow-3.jpg", cursor: "read before you pay" },
  { step: "04", title: "Pay & download", body: "UPI, card, or net banking. The QR ticket generates offline.", file: "temple/flow-4.jpg", cursor: "works on 2G" },
];

// Meenakshi anchors the turning point, so the wall holds the other six.
const VOICES = [
  { name: "Raghava", meta: "72 · Local veteran", quote: "At my age, I need someone to help me book online and with my wheelchair. These new technologies are so confusing for me." },
  { name: "Tulasi", meta: "34 · Housewife", quote: "I can't tell if my booking was successful or failed because everything is in red and green. I never know if there are tickets available." },
  { name: "Aruna", meta: "57 · Local pilgrim", quote: "I visit every month, but during festivals it's impossible to get tickets. We regulars should have some priority." },
  { name: "Sastry", meta: "62 · Priest coordinator", quote: "Coordinating multiple special ceremonies is complex enough, and now I have to manage everything through this new digital system." },
  { name: "Parvathi", meta: "47 · Customer service", quote: "During peak seasons I'm overwhelmed with queries. I need faster access to booking details to help everyone." },
  { name: "Gopinath", meta: "57 · Security agent", quote: "These fake tickets are harder to spot. We need a faster way to verify, especially across multiple entrances." },
];

const ITERATIONS = [
  {
    n: "01",
    title: "Virtual queue (waiting room)",
    body: "A 7-minute wait threshold triggered 50%+ drop-off. People refreshed and lost their place.",
    status: "failed" as const,
  },
  {
    n: "02",
    title: "Batch releases + upsells",
    body: "Adding post-booking steps (accommodation, meals) spiked abandonment from friction fatigue.",
    status: "failed" as const,
  },
  {
    n: "03",
    title: "Pre-registration with assigned windows",
    body: "Worked in testing, failed in the field: elderly and low-literacy users didn't return for their window.",
    status: "failed" as const,
  },
  {
    n: "04",
    title: "Real-time inventory + traffic-light status",
    body: "Available / Filling Fast / Sold Out, mapped to the IRCTC model people already trusted.",
    status: "shipped" as const,
  },
];

const METRICS = [
  { prefix: "$", value: 2.1, decimals: 1, suffix: "M+", label: "revenue generated" },
  { prefix: "", value: 174, decimals: 0, suffix: "", label: "temples onboarded statewide" },
  { prefix: "", value: 500, decimals: 0, suffix: "K", label: "users served" },
];

const SECONDARY_STATS = [
  { value: "0 → live", label: "first end-to-end digital booking" },
  { value: "200 → 100", label: "support queries a day" },
  { value: "1 → 174", label: "temples, after the free pilot" },
];

const REFLECTIONS = [
  {
    title: "Scope discipline",
    body: "Saying no is hardest with the features you believed in. We cut the upsells to protect the one thing pilgrims came for: the darshan ticket.",
  },
  {
    title: "Staff experience is the user experience",
    body: "A confused staff member at the gate undoes everything a smooth booking flow built. Operations should be in the room from week one.",
  },
  {
    title: "Language is a day-one constraint",
    body: "Telugu support was retrofitted late. For a platform serving rural Andhra pilgrims, multilingual design should have been there from the start.",
  },
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-caption-1 lowercase tracking-[0.04em]" style={{ color: "var(--accent)" }}>
        {children}
      </p>
      <Squiggle className="mt-1.5" />
    </div>
  );
}

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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-border px-3 py-1 font-mono text-caption-2 uppercase tracking-wide text-muted">
      {children}
    </span>
  );
}

// Photo-or-placeholder, square-cornered. Real images parallax-drift unless off.
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
        {
          yPercent: 6,
          scale: 1.12,
          ease: "none",
          scrollTrigger: { trigger: frameRef.current, start: "top bottom", end: "bottom top", scrub: true },
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

export function TempleCaseStudy() {
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
              <h1
                className="font-display leading-[1.02] text-text"
                style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                Scaling a sacred experience for millions.
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 max-w-[46ch] font-heading italic text-muted" style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)" }}>
                Digital darshan ticketing for Srisailam, that grew into a statewide platform.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5 border-y border-border py-6">
                {META.map((m) => (
                  <div key={m.label}>
                    <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">{m.label}</dt>
                    <dd className="mt-1 font-body text-body text-text">
                      {m.href ? (
                        <a href={m.href} target="_blank" rel="noopener noreferrer" className="underline decoration-from-font underline-offset-2" style={{ color: "var(--accent)" }}>
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
                src="/temple/hero.jpg"
                file="temple/hero.jpg"
                label="Hero: Srisailam booking app"
                aspect="aspect-[4/3] sm:aspect-[3/2]"
                cursorLabel="Om Namah Shivaya"
              />
            </Reveal>

            <Reveal delay={120}>
              <p
                className="mt-12 max-w-[24ch] font-heading leading-[1.12] text-text"
                style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)", letterSpacing: "-0.01em" }}
              >
                Most products start with a signed contract. This one started with a{" "}
                <span className="italic" style={{ color: "var(--accent)" }}>bet</span>.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Body className="mt-6">
                Build the whole platform for free, and let the product make the case. The free pilot was the strategy.
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
            <Statement className="mt-5">Every ticket was bought in person, on the day, in a 3 to 6 hour queue.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Srisailam draws millions of pilgrims. The crowd-management landscape around it was a patchwork of half-solutions, and none of them fixed the queue.
            </Body>
          </Reveal>
          <Reveal delay={150} variant="scale" className="mt-12">
            <Figure
              src="/temple/landscape.jpg"
              file="temple/landscape.jpg"
              label="Crowd-management landscape"
              aspect="aspect-[13/10]"
              cursorLabel="the landscape we studied"
              parallax={false}
            />
          </Reveal>
        </Section>

        {/* 3 - THE PROBLEM */}
        <Section id="problem">
          <Reveal>
            <Label>the problem</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Three problems, none of them about the UI.</Statement>
          </Reveal>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-3">
            {CHALLENGES.map((c, i) => (
              <Reveal key={c.title} delay={i * 80} className="h-full">
                <div className="flex h-full flex-col gap-4 p-8" style={{ backgroundColor: "var(--bg)" }}>
                  <span className="font-display" style={{ color: "var(--accent)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>
                    0{i + 1}
                  </span>
                  <h3 className="font-heading text-h4 leading-snug text-text">{c.title}</h3>
                  <Body className="!max-w-none">{c.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 4 - THE APPROACH */}
        <Section id="approach">
          <Reveal>
            <Label>the approach</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">What I owned, and the routes we ruled out.</Statement>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            <Reveal delay={100}>
              <div>
                <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">owned end to end</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OWNED.map((o) => (
                    <Pill key={o}>{o}</Pill>
                  ))}
                </div>
                <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="border-l-2 pl-4" style={{ borderColor: "var(--accent)" }}>
                    <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">North Star</dt>
                    <dd className="mt-1 font-heading text-h4 text-text">Booking conversion rate</dd>
                  </div>
                  <div className="border-l-2 pl-4" style={{ borderColor: "var(--accent)" }}>
                    <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">Health metric</dt>
                    <dd className="mt-1 font-heading text-h4 text-text">Task completion rate</dd>
                  </div>
                </dl>
              </div>
            </Reveal>
            <Reveal delay={150} variant="right">
              <Figure
                src="/temple/ecosystem.jpg"
                file="temple/ecosystem.jpg"
                label="Devotee portal ecosystem"
                aspect="aspect-square"
                cursorLabel="the wider ecosystem"
                parallax={false}
                className="border border-border"
              />
            </Reveal>
          </div>

          <Reveal delay={120} className="mt-12">
            <Body>
              We weighed four routes, a Maps feature, a kiosk, a website revamp, and a mobile app, before committing to mobile-first and scoping everything around the one job that mattered: booking a darshan.
            </Body>
          </Reveal>
          <Reveal delay={150} variant="scale" className="mt-8">
            <Figure
              src="/temple/exploration.jpg"
              file="temple/exploration.jpg"
              label="Brainstorming: four solution routes"
              aspect="aspect-[5/3]"
              cursorLabel="four routes, weighed"
              parallax={false}
              className="border border-border"
            />
          </Reveal>
        </Section>

        {/* 5 - THE SOLUTION (with the Meenakshi turning point) */}
        <Section id="solution">
          <Reveal>
            <Label>the solution</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Build something worthy of 20 years of faith.</Statement>
          </Reveal>

          {/* turning point */}
          <Reveal delay={100} variant="fade" className="mt-10">
            <figure className="border-l-2 pl-6" style={{ borderColor: "var(--accent)" }}>
              <blockquote
                className="font-heading leading-[1.3] text-text"
                style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.1rem)" }}
              >
                &ldquo;I have never missed a single Mahashivaratri in 20 years. If I lose my slot because of some mistake on a phone screen, how do I face my god?&rdquo;
              </blockquote>
              <figcaption className="mt-4 font-mono text-caption-1 uppercase tracking-wide text-muted">
                Meenakshi, 72 · Pilgrim
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={160}>
            <Body className="mt-6">
              That one line reframed the project. So the ticket now generates offline, before payment even confirms. Faith first, the receipt second.
            </Body>
          </Reveal>

          {/* the four-step flow */}
          <Reveal delay={80} className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">the booking flow, four steps</p>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {FLOW.map((f, i) => (
              <Reveal key={f.step} delay={i * 80}>
                <div className="flex h-full flex-col">
                  <Figure
                    src={`/${f.file}`}
                    file={f.file}
                    label={`Step ${f.step}`}
                    aspect="aspect-[12/25]"
                    cursorLabel={f.cursor}
                    parallax={false}
                    className="border border-border bg-white"
                  />
                  <div className="mt-4">
                    <span className="font-display" style={{ color: "var(--accent)", fontSize: "1.4rem", fontWeight: 700 }}>
                      {f.step}
                    </span>
                    <h3 className="mt-1 font-heading text-h4 leading-snug text-text">{f.title}</h3>
                    <Body className="mt-2 !max-w-none">{f.body}</Body>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 6 - IN THEIR WORDS */}
        <Section id="voices">
          <Reveal>
            <Label>in their words</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">We designed for seven very different people.</Statement>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {VOICES.map((v, i) => (
              <Reveal key={v.name} delay={(i % 3) * 70}>
                <figure className="flex h-full flex-col border border-border p-7" style={{ backgroundColor: "var(--bg)" }}>
                  <blockquote className="font-heading leading-snug text-text" style={{ fontSize: "1.15rem" }}>
                    &ldquo;{v.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 border-t border-border pt-4 font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                    {v.name} <span className="text-muted">· {v.meta}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 7 - WHAT DIDN'T WORK */}
        <Section id="iterations">
          <Reveal>
            <Label>what didn&rsquo;t work</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Three crowd-control ideas failed before one stuck.</Statement>
          </Reveal>
          <div className="mt-12 flex flex-col gap-4">
            {ITERATIONS.map((it, i) => {
              const shipped = it.status === "shipped";
              return (
                <Reveal key={it.n} delay={i * 70} variant={shipped ? "scale" : "up"}>
                  <div
                    className="flex flex-col gap-4 border p-7 sm:flex-row sm:items-start sm:gap-8"
                    style={{
                      borderColor: shipped ? "var(--accent)" : "var(--border)",
                      backgroundColor: shipped ? "color-mix(in srgb, var(--accent) 8%, var(--bg))" : "var(--bg)",
                    }}
                  >
                    <span
                      className="font-display shrink-0"
                      style={{ color: shipped ? "var(--accent)" : "var(--color-muted)", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}
                    >
                      {it.n}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-heading text-h4 leading-snug text-text">{it.title}</h3>
                        <span
                          className="font-mono text-caption-2 uppercase tracking-wide"
                          style={{ color: shipped ? "var(--accent)" : "var(--color-muted)" }}
                        >
                          {shipped ? "✓ shipped" : "✕ didn't work"}
                        </span>
                      </div>
                      <Body className="mt-2 !max-w-none">{it.body}</Body>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* 8 - THE OUTCOME */}
        <Section id="outcome">
          <Reveal>
            <Label>the outcome</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">From a free pilot to a statewide platform.</Statement>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <div className="border border-border p-8" style={{ backgroundColor: "var(--bg)" }}>
                  <p
                    className="font-display"
                    style={{ color: "var(--accent)", fontSize: "clamp(2.75rem, 6vw, 4.5rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}
                  >
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

          <Reveal delay={120}>
            <Body className="mt-8">
              The conversion rate went from zero (every ticket was physical) to a working digital flow on 2G, and the model was adopted by the Andhra Pradesh Endowments Department across 174 temples.
            </Body>
          </Reveal>
        </Section>

        {/* 9 - REFLECTION */}
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
              A ticket is a small thing. For someone who hasn&rsquo;t missed a festival in 20 years, it isn&rsquo;t.
            </p>
          </Reveal>
        </Section>
      </div>
    </div>
  );
}
