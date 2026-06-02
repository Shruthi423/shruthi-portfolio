"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { gsap, useGSAP } from "../lib/gsap";

/**
 * Campus Take case study - same editorial template as Temple
 * (left rail, lowercase labels, full-width images, scroll motion),
 * tuned for a tighter product story: a 5-move redesign, accessibility
 * specs, and an honest outcome status. Accent is U-M Tappan Red.
 *
 * Images live in /public/campus-take/; each falls back to a labelled
 * dashed-border placeholder so the page ships before any asset lands.
 */

// ---------------------------------------------------------------- project config

// Tappan Red splits light/dark for contrast on cream vs midnight.
const ACCENT_LIGHT = "#B81F2C"; // deep Tappan - readable on morning mist
const ACCENT_DARK = "#E54B3C"; // brighter brick - readable on warm midnight

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "problem", label: "the problem" },
  { id: "role", label: "my role" },
  { id: "redesign", label: "the redesign" },
  { id: "accessibility", label: "accessibility" },
  { id: "outcome", label: "the outcome" },
] as const;

const META: { label: string; value: string; href?: string }[] = [
  { label: "Role", value: "UX Designer" },
  { label: "Client", value: "U-M MDining" },
  { label: "Year", value: "2026" },
  { label: "Live", value: "campustake.umich.edu", href: "https://campustake.talkingmaizeandblue.umich.edu/" },
];

// What I did, as pills under the role section.
const DID = ["Research", "Concept", "Prototyping", "Motion design", "Vibe-coded front-end", "GitHub PR"];

// The tools I shipped with. Front-end stack first, services beneath.
const STACK = ["React", "Vite", "CSS Animation", "GitHub", "Node / Express", "PostgreSQL"];

// The five moves that turned a survey tool into a daily ritual. Rendered
// as a numbered manifesto: accent numeral, title, one-paragraph body.
const CHANGES = [
  {
    n: "01",
    title: "One thing at a time.",
    body: "Redesigned the flow into three full-screen steps, Vote → Predict → Reveal, inspired by Typeform. The reveal becomes a genuine surprise, not a table students can see before they vote.",
  },
  {
    n: "02",
    title: "Motion as meaning.",
    body: "A Tappan Red → Navy splash animation on load. Animated bar charts on the reveal. Confetti for accurate predictions. SVG line-icon micro-animations in the nav (sun rays, anticlockwise clock, confetti burst, pen scribble).",
  },
  {
    n: "03",
    title: "Mobile first, always.",
    body: "A dedicated bottom navigation bar, dot step indicators, full-width tap targets, and a horizontally scrolling mood strip. The primary audience is students on their phones in a dining hall.",
  },
  {
    n: "04",
    title: "Keeping them coming back.",
    body: "A streak card, tomorrow's question teaser, a campus mood reaction strip, and a live vote counter, to turn a one-time interaction into a daily habit.",
  },
  {
    n: "05",
    title: "Closing the loop.",
    body: "A full Propose a Question screen with writing tips, category tags, and a success confirmation, reducing poor submissions and making contributors feel heard.",
  },
];

// Four accessibility specs, rendered as a 2x2 grid of bordered cells.
const ACCESSIBILITY = [
  { spec: "WCAG AA", note: "All text meets contrast ratios across both themes." },
  { spec: "48px touch", note: "Minimum interactive target size for finger-first use." },
  { spec: "ARIA labels", note: "Throughout, so the experience holds up with screen readers." },
  { spec: "Keyboard A–H", note: "Letter shortcuts to select an option, Enter to advance." },
];

// ---------------------------------------------------------------- helpers

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-caption-1 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
        {children}
      </p>
    </div>
  );
}

function Statement({
  children,
  className = "",
  maxW = "30ch",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  maxW?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      className={`font-heading leading-[1.1] text-text ${className}`}
      style={{ maxWidth: maxW, fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.01em", ...style }}
    >
      {children}
    </h2>
  );
}

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
  parallax = false,
  fit = "cover",
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
  fit?: "cover" | "contain";
}) {
  const [errored, setErrored] = useState(false);
  const showImage = !!src && !errored;
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (!showImage || !parallax || fit === "contain" || prefersReduced()) return;
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
          className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
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
  duration = 1400,
}: {
  value: number;
  prefix?: string;
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
  const display = Math.round(n).toLocaleString("en-US");
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

export function CampusTakeCaseStudy() {
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
                Turning a survey into a daily ritual.
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 whitespace-nowrap font-heading italic text-muted" style={{ fontSize: "clamp(0.55rem, 2.65vw, 1.5rem)" }}>
                A daily opinion poll for 53,000+ U-M students, redesigned around vote, predict, reveal.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5 border-y border-border py-6">
                {META.map((m) => (
                  <div key={m.label}>
                    <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">{m.label}</dt>
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

            <Reveal delay={240} variant="scale" className="mt-10">
              <Figure
                src="/campus-take/cover.png"
                file="campus-take/cover.png"
                label="Hero: Campus Take wordmark cover"
                aspect="aspect-[4/3] sm:aspect-[3/2]"
                cursorLabel="vote · predict · reveal"
                fit="contain"
                parallax={false}
              />
            </Reveal>

            <Reveal delay={120}>
              <p
                className="mt-12 whitespace-nowrap font-heading leading-[1.12] text-text"
                style={{ fontSize: "clamp(0.55rem, 2.75vw, 2.4rem)", letterSpacing: "-0.01em" }}
              >
                Most polls ask one question. This one starts a{" "}
                <span className="italic" style={{ color: "var(--accent)" }}>habit</span>.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Body className="mt-6">
                Students vote on a question of the day, predict what campus thinks, and watch the animated reveal. I was brought in as the UX designer to make both halves of that experience, student and editor, feel as good as the question deserves.
              </Body>
            </Reveal>
          </div>
        </section>

        {/* 2 - THE PROBLEM */}
        <Section id="problem">
          <Reveal>
            <Label>the problem</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.55rem, 2.75vw, 2.5rem)" }}>
              The site worked. It just didn&rsquo;t pull anyone back.
            </Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              A yellow-gradient background, eight heavy navy buttons stacked vertically, a plain results table, and a seven-item navbar. It felt like a survey tool from a class assignment, not a daily product. On mobile, the experience was an afterthought.
            </Body>
          </Reveal>
          <Reveal delay={150} variant="scale" className="mt-12">
            <Figure
              src="/campus-take/before.jpg"
              file="campus-take/before.jpg"
              label="The original site, before redesign"
              aspect="aspect-[13/10]"
              cursorLabel="what it looked like"
              parallax={false}
            />
          </Reveal>
        </Section>

        {/* 3 - MY ROLE */}
        <Section id="role">
          <Reveal>
            <Label>my role</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.55rem, 2.75vw, 2.4rem)" }}>
              End to end. UX through Pull Request.
            </Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Research, concept, prototyping, motion design, and vibe-coded production-ready front-end code, shipped via GitHub Pull Request. One designer, one branch, one open PR.
            </Body>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <Reveal delay={80}>
              <div>
                <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">what I did</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DID.map((d) => (
                    <Pill key={d}>{d}</Pill>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">what I shipped with</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STACK.map((s) => (
                    <Pill key={s}>{s}</Pill>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* 4 - THE REDESIGN (numbered manifesto rows) */}
        <Section id="redesign">
          <Reveal>
            <Label>the redesign</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>
              Five moves, one ritual.
            </Statement>
          </Reveal>

          <div className="mt-12 border-t border-border">
            {CHANGES.map((c, i) => (
              <Reveal key={c.n} delay={i * 60}>
                <div className="grid grid-cols-1 gap-3 border-b border-border py-7 sm:grid-cols-[auto_1fr] sm:gap-10 sm:py-9">
                  <span
                    className="font-display tabular-nums sm:w-20"
                    style={{
                      color: "var(--accent)",
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      fontWeight: 700,
                      lineHeight: 0.95,
                    }}
                  >
                    {c.n}
                  </span>
                  <div>
                    <h3
                      className="font-heading leading-tight text-text"
                      style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.8rem)" }}
                    >
                      {c.title}
                    </h3>
                    <Body className="mt-3 !max-w-none">{c.body}</Body>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* the three-step flow as a 3-up figure row */}
          <Reveal delay={80} className="mt-16">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">the three-step flow</p>
          </Reveal>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { src: "/campus-take/vote.jpg", file: "campus-take/vote.jpg", step: "01", title: "Vote", cursor: "your take" },
              { src: "/campus-take/predict.jpg", file: "campus-take/predict.jpg", step: "02", title: "Predict", cursor: "what campus thinks" },
              { src: "/campus-take/reveal.jpg", file: "campus-take/reveal.jpg", step: "03", title: "Reveal", cursor: "the animated reveal" },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 80}>
                <div className="flex h-full flex-col">
                  <Figure
                    src={s.src}
                    file={s.file}
                    label={`${s.step} · ${s.title}`}
                    aspect="aspect-[3/4]"
                    cursorLabel={s.cursor}
                    parallax={false}
                    className="border border-border"
                  />
                  <div className="mt-4">
                    <span className="font-display" style={{ color: "var(--accent)", fontSize: "1.3rem", fontWeight: 700 }}>
                      {s.step}
                    </span>
                    <h4 className="mt-1 font-heading leading-snug text-text" style={{ fontSize: "1.15rem" }}>{s.title}</h4>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 5 - ACCESSIBILITY */}
        <Section id="accessibility">
          <Reveal>
            <Label>accessibility</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>
              Built to be used by everyone.
            </Statement>
          </Reveal>
          <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {ACCESSIBILITY.map((a, i) => (
              <Reveal key={a.spec} delay={i * 60} className="h-full">
                <div className="flex h-full flex-col gap-3 p-6" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                    ✓ {a.spec}
                  </p>
                  <p className="font-body leading-relaxed text-muted" style={{ fontSize: "0.92rem" }}>
                    {a.note}
                  </p>
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
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>
              Shipped to a Pull Request, pending review.
            </Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              I delivered a production-ready interactive mockup and a documented Pull Request on GitHub. The redesign is pending professor review for deployment to the live site serving the dining halls across the University of Michigan.
            </Body>
          </Reveal>

          {/* the headline number + the live link, on a tinted card */}
          <Reveal delay={160} variant="scale" className="mt-12">
            <div
              className="border-2 p-7 sm:p-10"
              style={{
                borderColor: "var(--accent)",
                backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--bg))",
              }}
            >
              <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
                <div>
                  <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                    audience ready
                  </p>
                  <p
                    className="mt-3 font-display tabular-nums leading-none text-text"
                    style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 700, letterSpacing: "-0.02em" }}
                  >
                    <CountUp value={53000} suffix="+" />
                  </p>
                  <p className="mt-2 font-mono text-caption-1 uppercase tracking-wide text-muted">U-M students across MDining halls</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">live preview</p>
                  <a
                    href="https://campustake.talkingmaizeandblue.umich.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="see it live"
                    className="mt-2 inline-block font-heading underline decoration-1 underline-offset-4 transition-colors hover:text-[var(--accent)]"
                    style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.3rem)" }}
                  >
                    campustake.talkingmaizeandblue.umich.edu →
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </Section>
      </div>
    </div>
  );
}
