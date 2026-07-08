"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/components/shared/ThemeProvider";
import { gsap, useGSAP } from "@/app/lib/gsap";

/**
 * Zuge case study - same editorial template (left rail, lowercase labels,
 * full-width square images, scroll motion), tuned for an HMI / interaction
 * story: research findings, two design iterations (one failed, one shipped),
 * and a gallery of dashboard states. Accent is an electric blue; the voice is
 * measured. Images live in /public/zuge/.
 */

const ACCENT_LIGHT = "#2E6FA3"; // electric blue - readable on morning mist
const ACCENT_DARK = "#7FB8E8"; // lighter blue - readable on warm midnight

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "problem", label: "the problem" },
  { id: "research", label: "research" },
  { id: "iterations", label: "what didn't work" },
  { id: "dashboard", label: "the dashboard" },
  { id: "context", label: "in context" },
  { id: "outcome", label: "the outcome" },
  { id: "reflection", label: "reflection" },
] as const;

const META: { label: string; value: string; href?: string }[] = [
  { label: "Role", value: "Design Consultant (UX/UI)" },
  { label: "Team", value: "1 Product Lead, 2 Senior UX, 3 stakeholders, me" },
  { label: "Duration", value: "6 months · Jun 2023 – Jul 2024" },
  { label: "Company", value: "Sharp × Zuge Electric" },
  { label: "Platform", value: "7-inch TFT touchscreen" },
  { label: "Live", value: "zugeelectric.com", href: "https://zugeelectric.com/we-are/" },
];

const FINDINGS = [
  "Checked their phone 5+ times per delivery.",
  "Had a near-miss from a glance down at speed.",
  "Felt range anxiety in the middle of a shift.",
  "Wanted a built-in display over a taped-on phone.",
];

const STUDIED = ["Ola S1 Pro", "Ather 450X", "TVS iQube"];

const ITERATIONS = [
  {
    n: "01",
    title: "Split-screen layout",
    body: "Map and order, side by side. The logic was airtight: riders needed both, so show both. But on a 7-inch screen at 40km/h, neither half was glanceable. The map was too small, the text too cramped, and riders squinted, the exact behaviour we were trying to kill.",
    status: "failed" as const,
  },
  {
    n: "02",
    title: "Layered overlays",
    body: "Navigation owns the full screen. Order, battery, and alerts surface as minimal overlays, present when needed, gone when not. The overlay version scored far higher on glance time and comprehension. That killed split-screen entirely.",
    status: "shipped" as const,
  },
];

const SCREENS = [
  { file: "zuge/screen-lock.jpg", label: "Lock screen", cursor: "enter passcode" },
  { file: "zuge/screen-drive.jpg", label: "On the road: speed, nav & music", cursor: "one glance" },
  { file: "zuge/screen-ride.jpg", label: "Ride mode", cursor: "just ride" },
  { file: "zuge/screen-parked.jpg", label: "Parked", cursor: "take off your stand" },
  { file: "zuge/screen-settings.jpg", label: "Settings", cursor: "deep, but out of the way" },
  { file: "zuge/screen-access.jpg", label: "Accessibility", cursor: "dark / mono / high-contrast" },
];

// The overlays the rider actually touches mid-shift, shown as standalone
// components rather than full screens. Each sits centred in a uniform tile so
// the landscape and portrait pieces read as one consistent set.
const COMPONENTS = [
  { file: "zuge/meter.png", label: "Battery & range", cursor: "96% · 145 km" },
  { file: "zuge/orders.png", label: "Incoming order", cursor: "₹350 · accept" },
  { file: "zuge/location.png", label: "Rider location", cursor: "500 m away" },
];

// The shipped UI rendered on the real chassis, across the colourways riders buy.
const PROTOTYPES = [
  { file: "zuge/prototype-1.png", label: "Turn-by-turn at 48 km/h", cursor: "650 m to turn" },
  { file: "zuge/prototype-3.png", label: "Settings & vehicle health", cursor: "parked" },
  { file: "zuge/prototype-4.png", label: "Navigation, normal mode", cursor: "350 m ahead" },
  { file: "zuge/prototype-2.png", label: "Parked · CO₂ avoided", cursor: "2.2 g saved" },
];

const METRICS = [
  { prefix: "", value: 73, decimals: 0, suffix: "%", label: "less phone use on the road" },
  { prefix: "", value: 20, decimals: 0, suffix: "%", label: "faster task completion" },
  { prefix: "", value: 2, decimals: 0, suffix: "M+", label: "gig riders on the platform" },
];

const SECONDARY_STATS = [
  { value: "45 → 87", label: "rider satisfaction score" },
  { value: "3 → 1", label: "apps a rider juggles" },
  { value: "7-inch", label: "the entire canvas" },
];

const REFLECTIONS = [
  {
    title: "Removal is the work",
    body: "The shipped dashboard had half the elements of the first prototype. The earnings tracker, in-app messaging, text-heavy overlays, all cut. Every removal was a safety decision dressed as a design one.",
  },
  {
    title: "Test where the work happens",
    body: "Split-screen looked fine at a desk. It only fell apart at 40km/h in real traffic. Testing in the field, not the studio, is the only reason we caught it.",
  },
  {
    title: "Constraints clarify",
    body: "A 7-inch screen at 40km/h isn't a limitation, it's the entire design question. Hierarchy, touch targets, glance time: every call was made inside that one constraint.",
  },
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
    <p className={`font-body leading-relaxed text-muted ${className}`} style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)" }}>
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-border px-3 py-1 font-mono text-caption-2 uppercase tracking-wide text-muted">{children}</span>
  );
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
        <img ref={imgRef} src={src} alt={alt ?? label} className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`} style={{ objectPosition: position }} onError={() => setErrored(true)} />
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
      <span className="max-w-[85%] text-center font-mono text-caption-1 uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--accent) 75%, var(--color-muted))" }}>
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

export function ZugeCaseStudy() {
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
                Dashboard built for 40km/h.
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-4 font-heading italic text-muted" style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)" }}>
                India&rsquo;s delivery riders run 30+ orders a day with a phone taped to the handlebar. I led the UX and interaction design for the dashboard that replaced it.
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
                          data-cursor-label="visit"
                          className="underline decoration-1 underline-offset-4 transition-colors hover:[color:var(--accent)]"
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
              <Figure src="/zuge/hero.png" file="zuge/hero.png" label="Hero: the Zuge dashboard" aspect="aspect-video" cursorLabel="tap to begin" />
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-12 font-heading leading-[1.12] text-text" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)", letterSpacing: "-0.01em" }}>
                At 40km/h, a two-second glance is <span className="italic" style={{ color: "var(--accent)" }}>22 metres</span> travelled blind.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <Body className="mt-6">
                Three apps open at once: navigation on one, orders on another, earnings on a third. Every notification was a reason to look down. Every glance was a moment of blindness at speed.
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
            <Statement maxW="none" className="mt-5">Every rider was doing this job with a phone taped to the handlebar.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">Across 20+ ride-alongs, the same patterns kept surfacing. None of them were about taste. All of them were about safety.</Body>
          </Reveal>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {FINDINGS.map((f, i) => (
              <Reveal key={f} delay={i * 70} className="h-full">
                <div className="flex h-full flex-col gap-5 p-7" style={{ backgroundColor: "var(--bg)" }}>
                  <span className="font-display" style={{ color: "var(--accent)", fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>
                    0{i + 1}
                  </span>
                  <p className="font-heading leading-snug text-text" style={{ fontSize: "1.15rem" }}>{f}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 3 - RESEARCH */}
        <Section id="research">
          <Reveal>
            <Label>research</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">How might we give riders back the space to just ride?</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              20+ interviews across Swiggy, Zomato, and Zepto riders. Heuristic teardowns of the Ola S1 Pro, Ather 450X, and TVS iQube. Lo-fi and hi-fi prototypes tested in real traffic, not at a desk. Four riders became recurring design partners.
            </Body>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="font-mono text-caption-2 uppercase tracking-wide text-muted">dashboards we tore down</span>
              {STUDIED.map((s) => (
                <Pill key={s}>{s}</Pill>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">form studies: finding the screen&rsquo;s silhouette</p>
          </Reveal>
          <Reveal delay={150} variant="scale" className="mt-5">
            <Figure src="/zuge/form-studies.png" file="zuge/form-studies.png" label="Hand-drawn form studies" aspect="aspect-[7/3]" cursorLabel="finding the form" className="border border-border" />
          </Reveal>
        </Section>

        {/* 4 - WHAT DIDN'T WORK */}
        <Section id="iterations">
          <Reveal>
            <Label>what didn&rsquo;t work</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">The obvious layout was the wrong one.</Statement>
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
                    <span className="font-display shrink-0" style={{ color: shipped ? "var(--accent)" : "var(--color-muted)", fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>
                      {it.n}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-heading text-h4 leading-snug text-text">{it.title}</h3>
                        <span className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: shipped ? "var(--accent)" : "var(--color-muted)" }}>
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

        {/* 5 - THE DASHBOARD */}
        <Section id="dashboard">
          <Reveal>
            <Label>the dashboard</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">Navigation owns the screen. Everything else waits its turn.</Statement>
          </Reveal>

          <Reveal delay={100} variant="fade" className="mt-10">
            <figure className="border-l-2 pl-6" style={{ borderColor: "var(--accent)" }}>
              <blockquote className="font-heading leading-[1.3] text-text" style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.1rem)" }}>
                &ldquo;No tap, no app switch?&rdquo;
              </blockquote>
              <figcaption className="mt-4 font-mono text-caption-1 uppercase tracking-wide text-muted">Rider B, two years on the job</figcaption>
            </figure>
          </Reveal>
          <Reveal delay={160}>
            <Body className="mt-6">
              He&rsquo;d accepted app-switching as part of the cost of the work. So navigation now auto-loads the moment an order is accepted, zero extra taps. Order, battery, and calls arrive as minimal overlays: present when needed, invisible when not. Removal was the work, the earnings tracker, in-app messaging, and text-heavy panels were all cut for safety.
            </Body>
          </Reveal>

          <Reveal delay={80} className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">the overlays, as components</p>
          </Reveal>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {COMPONENTS.map((c, i) => (
              <Reveal key={c.file} delay={i * 70}>
                <div>
                  <Figure src={`/${c.file}`} file={c.file} label={c.label} aspect="aspect-[4/3]" cursorLabel={c.cursor} fit="contain" className="border border-border bg-surface/40" />
                  <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">{c.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={80} className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">the dashboard, across states</p>
          </Reveal>
          <div className="mt-6 flex flex-col gap-10">
            {SCREENS.map((s, i) => (
              <Reveal key={s.file} delay={i * 40}>
                <div>
                  <Figure src={`/${s.file}`} file={s.file} label={s.label} aspect="aspect-video" cursorLabel={s.cursor} parallax={false} className="border border-border" />
                  <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 6 - IN CONTEXT */}
        <Section id="context">
          <Reveal>
            <Label>in context</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">Final screens, on the bike.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Rendered on the real chassis, across the colourways riders actually buy. The hierarchy that held up at a desk had to hold up here too: at a glance, in sun, mid-shift.
            </Body>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {PROTOTYPES.map((p, i) => (
              <Reveal key={p.file} delay={i * 60}>
                <div>
                  <Figure src={`/${p.file}`} file={p.file} label={p.label} aspect="aspect-[5/4]" cursorLabel={p.cursor} fit="contain" className="border border-border bg-surface/40" />
                  <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">{p.label}</p>
                </div>
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
            <Statement maxW="none" className="mt-5">Less looking down, more riding.</Statement>
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

        {/* 8 - REFLECTION */}
        <Section id="reflection">
          <Reveal>
            <Label>reflection</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">What I&rsquo;d carry into the next one.</Statement>
          </Reveal>
          {/* lessons as wide editorial rows: big accent numeral on the
              left, lesson title in heading + body in the gutter. Top &
              bottom hairlines for rhythm. */}
          <div className="mt-12 border-t border-border">
            {REFLECTIONS.map((r, i) => (
              <Reveal key={r.title} delay={i * 80}>
                <div className="grid grid-cols-1 gap-4 border-b border-border py-9 sm:grid-cols-[auto_1fr] sm:gap-10 sm:py-12">
                  <span
                    className="font-display tabular-nums sm:w-24"
                    style={{
                      color: "var(--accent)",
                      fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                      fontWeight: 700,
                      lineHeight: 0.9,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3
                      className="font-heading leading-tight text-text"
                      style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
                    >
                      {r.title}
                    </h3>
                    <Body className="mt-3 !max-w-none">{r.body}</Body>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
