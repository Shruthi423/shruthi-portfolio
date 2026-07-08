"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/components/shared/ThemeProvider";
import { gsap, useGSAP } from "@/app/lib/gsap";

/**
 * UMSI Expo Badges - print + visual-identity case study.
 *
 * Pattern: visual-led, light on narrative. The work IS the artifact (a
 * pictogram badge system), so the page favors big visuals + small captions
 * over long prose. Section count is intentionally low: overview, objectives,
 * the brand palette I had to work inside, and the badges themselves.
 *
 * Image slots use a labelled placeholder (dashed border + accent caption)
 * until the real artwork lands in /public/umsi-expo-badges/. Drop a file,
 * point the BADGE entry at it, and the slot becomes the real image.
 */

// ---------------------------------------------------------------- project config

// UMSI's brand colors, mapped to day/night accents. Maize pops on the warm
// midnight background; Ross Orange settles on the cream day background.
const ACCENT_LIGHT = "#D86018"; // Ross Orange - readable on morning mist
const ACCENT_DARK = "#FFCB05"; // Maize - readable on warm midnight

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "objectives", label: "objectives" },
  { id: "palette", label: "palette" },
  { id: "badges", label: "the badges" },
] as const;

const META = [
  { label: "Timeline", value: "2 weeks" },
  { label: "Role", value: "Graphic Designer" },
  { label: "Team", value: "Solo" },
  { label: "Tools", value: "Illustrator, Procreate, Figma" },
];

// The brief's four objectives, kept verbatim in spirit + tightened for
// scanning. Each gets its own card so they read as design constraints,
// not paragraphs of background.
const OBJECTIVES = [
  {
    name: "Create visual interest",
    body: "Catch the audience's attention and draw them into the key themes presented on each poster.",
  },
  {
    name: "Ease of identification",
    body: "Inform visitors about the award categories and help judges spot which posters are under consideration.",
  },
  {
    name: "Provide cohesion",
    body: "Every badge had to read as one family. Consistent color, type, and style across the set.",
  },
  {
    name: "Enhance the event",
    body: "Match the celebratory atmosphere of Exposition. Feel like a moment, not a label.",
  },
];

// UMSI's official palette as it was given to me - two primaries (Maize + Blue)
// and three secondaries (Ross Orange, Wave Field Green, Angell Hall Ash).
// PMS / CMYK values reflect the brand guide; HEX is what the badges use on
// screen and in this case study.
const PALETTE = [
  {
    name: "Maize",
    tier: "Primary",
    hex: "#FFCB05",
    pms: "PMS 7406",
    cmyk: "C0 M18 Y100 K0",
    fg: "#00274C", // U-M Blue on Maize for max contrast
  },
  {
    name: "Blue",
    tier: "Primary",
    hex: "#00274C",
    pms: "PMS 282",
    cmyk: "C100 M60 Y0 K60",
    fg: "#FFCB05",
  },
  {
    name: "Ross Orange",
    tier: "Secondary",
    hex: "#D86018",
    pms: "PMS 1595",
    cmyk: "C0 M71 Y100 K3",
    fg: "#FAF7F0",
  },
  {
    name: "Wave Field Green",
    tier: "Secondary",
    hex: "#A5A508",
    pms: "PMS 398",
    cmyk: "C14 M6 Y100 K24",
    fg: "#171520",
  },
  {
    name: "Angell Hall Ash",
    tier: "Secondary",
    hex: "#989C97",
    pms: "PMS 877",
    cmyk: "C0 M0 Y0 K40",
    fg: "#171520",
  },
];


// ---------------------------------------------------------------- helpers

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Soft fade + slide reveal as elements scroll in. Same gentle pattern as
// the other case studies so the page feels of a piece.
function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale" | "fade";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReduced()) return;
      const el = ref.current;
      if (!el) return;
      const from = (() => {
        switch (variant) {
          case "left":
            return { x: -32, opacity: 0 };
          case "right":
            return { x: 32, opacity: 0 };
          case "scale":
            return { scale: 0.96, opacity: 0 };
          case "fade":
            return { opacity: 0 };
          default:
            return { y: 28, opacity: 0 };
        }
      })();
      gsap.fromTo(el, from, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.85,
        ease: "power3.out",
        delay: delay / 1000,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: ref, dependencies: [variant, delay] },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Section eyebrow - matches the pattern across the other case studies.
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-caption-2 uppercase tracking-wide"
      style={{ color: "var(--accent)" }}
    >
      {children}
    </span>
  );
}

// Section heading - one rung below the page h1. Defaults to no max-width
// cap so the headline can fill the column.
function Statement({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-heading leading-[1.1] text-text ${className}`}
      style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h2>
  );
}

// Body copy - left-aligned, full section width.
function Body({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-body leading-relaxed text-text ${className}`}
      style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)" }}
    >
      {children}
    </p>
  );
}

// Figure - either an <img> with cover crop, or a labelled placeholder card
// (dashed accent border) for unfilled slots. Mirrors the placeholder pattern
// from the other case studies so future image drops are zero-friction.
function Figure({
  src,
  alt,
  label,
  aspect = "aspect-square",
  cursorLabel,
  className = "",
}: {
  src?: string;
  alt?: string;
  label: string;
  aspect?: string;
  cursorLabel?: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const showImage = !!src && !errored;

  if (showImage) {
    return (
      <div
        className={`relative w-full overflow-hidden ${aspect} ${className}`}
        data-cursor-label={cursorLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? label}
          className="absolute inset-0 h-full w-full object-cover"
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
    </div>
  );
}

// Section wrapper - same scroll-margin + max-w-6xl envelope as the other
// case studies, with the new tighter py-8 md:py-12 vertical rhythm.
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
    <section
      id={id}
      className={`scroll-mt-24 px-6 py-8 sm:px-10 md:py-12 lg:pl-32 lg:pr-12 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

// Left-edge section rail (desktop only). The other case studies all have one;
// keeps the page navigable and gives the design a consistent silhouette.
function SectionRail({
  active,
  onJump,
}: {
  active: string;
  onJump: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Case study sections"
      className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3.5 md:flex"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onJump(s.id)}
            aria-label={`Jump to ${s.label}`}
            data-cursor-label={s.label}
            className="group relative flex items-center"
          >
            <span
              className="inline-block h-2 w-2 rounded-full transition-all duration-200"
              style={{
                backgroundColor: isActive
                  ? "var(--accent)"
                  : "color-mix(in srgb, var(--color-muted) 60%, transparent)",
                transform: isActive ? "scale(1.4)" : "scale(1)",
              }}
            />
            <span
              className={`pointer-events-none absolute left-7 whitespace-nowrap rounded-md bg-surface px-2 py-0.5 font-mono text-caption-2 uppercase tracking-wide shadow-sm transition-all duration-200 ease-out ${
                isActive
                  ? "opacity-100"
                  : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
              }`}
              style={{ color: "var(--text)" }}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// Mobile top-edge progress bar (scrolls to fill as you read).
function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${pct})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-muted/20 md:hidden">
      <div
        ref={ref}
        className="h-full origin-left"
        style={{ backgroundColor: "var(--accent)", transform: "scaleX(0)" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------- page

export function UMSIExpoBadgesCaseStudy() {
  const [active, setActive] = useState<string>("overview");
  const { resolvedTheme } = useTheme();
  const accent = resolvedTheme === "dark" ? ACCENT_DARK : ACCENT_LIGHT;

  // IntersectionObserver tracks which section is in view for the rail.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div
      className="relative min-h-screen"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <ProgressBar />
      <SectionRail active={active} onJump={jumpTo} />

      <div className="relative">
        {/* 1 - OVERVIEW + hero */}
        <section
          id="overview"
          className="scroll-mt-24 px-6 pb-8 pt-28 sm:px-10 md:pt-32 lg:pl-32 lg:pr-12"
        >
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <h1
                className="font-display leading-[1.02] text-text"
                style={{
                  fontSize: "clamp(2.5rem, 7vw, 5rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                UMSI Expo Badges
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p
                className="mt-4 max-w-[44ch] font-heading italic text-muted"
                style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)" }}
              >
                A badge system for the UMSI Expo: one family, hundreds of student posters.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5 border-y border-border py-6">
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

            <Reveal delay={240} variant="scale" className="mt-10">
              <Figure
                src="/umsi-expo-badges/hero.jpg"
                label="Hero: badge system in context"
                aspect="aspect-[3/2] sm:aspect-[16/9]"
                cursorLabel="the brief, at a glance"
              />
            </Reveal>

            {/* Intro prose - lifted from the brief, tightened. Sits beneath
                the hero so the reader knows what they're looking at before
                the objectives + palette beats. */}
            <Reveal delay={120}>
              <Body className="mt-10">
                The UMSI Engaged Learning Office commissioned a set of pictogram
                badges to identify award categories at the UMSI Exposition on
                April 20, 2026. The badges live on hundreds of student posters,
                across digital communications, and on event signage. They had to
                help audiences find what to look at, help judges spot which
                posters were under consideration, and feel like a moment, not a
                label.
              </Body>
            </Reveal>
          </div>
        </section>

        {/* 2 - OBJECTIVES */}
        <Section id="objectives">
          <Reveal>
            <Label>objectives</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Four constraints, one system.</Statement>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
            {OBJECTIVES.map((o, i) => (
              <Reveal
                key={o.name}
                delay={i * 70}
                variant={i % 2 === 0 ? "left" : "right"}
              >
                <div
                  className="flex h-full flex-col gap-3 border border-border p-6 sm:p-7"
                  style={{ backgroundColor: "var(--bg)" }}
                >
                  <span
                    className="font-display"
                    style={{
                      color: "var(--accent)",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      lineHeight: 1,
                      opacity: 0.7,
                    }}
                  >
                    0{i + 1}
                  </span>
                  <p
                    className="font-heading leading-tight text-text"
                    style={{ fontSize: "clamp(1.15rem, 1.9vw, 1.4rem)" }}
                  >
                    {o.name}
                  </p>
                  <Body className="mt-1">{o.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 3 - PALETTE (UMSI brand colors I had to design within) */}
        <Section id="palette">
          <Reveal>
            <Label>palette</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">The colors I had to work inside.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              UMSI&rsquo;s brand palette is fixed: two primaries (Maize, Blue) and three
              secondaries (Ross Orange, Wave Field Green, Angell Hall Ash). The badge
              system pulls from all five so it can sit beside any U-M asset.
            </Body>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            {PALETTE.map((c, i) => (
              <Reveal key={c.hex} delay={i * 60} variant="up">
                <div className="flex h-full flex-col border border-border">
                  <div
                    className="flex h-32 items-end justify-between p-4"
                    style={{ backgroundColor: c.hex, color: c.fg }}
                    data-cursor-label={c.name.toLowerCase()}
                  >
                    <span
                      className="font-mono text-caption-2 uppercase tracking-wide"
                      style={{ opacity: 0.8 }}
                    >
                      {c.tier}
                    </span>
                    {/* HEX in Figtree (font-mono token, was font-display
                        Dahlia) for cleaner legibility. tabular-nums keeps
                        digits aligned between cards; slight letter-spacing
                        gives the code a 'set-in-print' feel. */}
                    <span
                      className="font-mono"
                      style={{
                        fontWeight: 700,
                        fontSize: "clamp(1.05rem, 1.7vw, 1.3rem)",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {c.hex.replace("#", "")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4" style={{ backgroundColor: "var(--bg)" }}>
                    {/* Name sized to fit 'Wave Field Green' and 'Angell Hall
                        Ash' on one line even in the tightest 5-column slot.
                        whitespace-nowrap is a belt-and-suspenders guard. */}
                    <p
                      className="font-heading text-text whitespace-nowrap"
                      style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.3rem)", lineHeight: 1.2 }}
                    >
                      {c.name}
                    </p>
                    <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">
                      {c.pms}
                    </p>
                    <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">
                      {c.cmyk}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 4 - THE BADGES — removed until final artwork lands. Was a 4-slot
            placeholder grid (empty dashed tiles + "TBD" captions). Restore the
            Section and its BADGES data from git history once the art exists. */}
      </div>
    </div>
  );
}
