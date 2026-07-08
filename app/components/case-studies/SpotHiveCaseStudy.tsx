"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/components/shared/ThemeProvider";
import { gsap, useGSAP } from "@/app/lib/gsap";

/**
 * SpotHive — 0-to-1 workspace booking product (Sharp Corporation, 2023–2024).
 *
 * A product-design case study: problem → one-month build → the live seat map →
 * global rollout. The image-heavy sections use a two-panel sticky layout: the
 * text stays pinned on the left while that section's phone screens scroll past
 * on the right, till the section ends. Screens are shown uncropped at their
 * native portrait ratio (1290×2796). All screens live in /public/spothive/.
 */

// A calm workspace blue: readable on the cream day paper and the warm midnight.
const ACCENT_LIGHT = "#2E6FB0";
const ACCENT_DARK = "#8FC0EE";

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "challenge", label: "the challenge" },
  { id: "onboarding", label: "getting in" },
  { id: "system", label: "the system" },
  { id: "seatmap", label: "the seat map" },
  { id: "rollout", label: "the outcome" },
] as const;

// Native ratio of every screen (1290 × 2796 iPhone export) — used to frame each
// shot uncropped.
const PHONE_ASPECT = "1290 / 2796";

// Per-section screen sets, in narrative order.
const ONBOARDING_SHOTS = [
  { src: "/spothive/login-1.jpg", label: "Login, step one", cursor: "welcome in" },
  { src: "/spothive/login-2.jpg", label: "Login, step two", cursor: "who are you" },
  { src: "/spothive/login-3.jpg", label: "Login, step three", cursor: "almost there" },
  { src: "/spothive/login-4.jpg", label: "Login, step four", cursor: "you're set" },
];

const SYSTEM_SHOTS = [
  { src: "/spothive/dashboard-1.jpg", label: "Dashboard", cursor: "your day" },
  { src: "/spothive/dashboard-3.jpg", label: "Dashboard, list view", cursor: "at a glance" },
  { src: "/spothive/dashboard-calendar.jpg", label: "Dashboard, calendar (dark)", cursor: "the week ahead" },
  { src: "/spothive/dashboard-3-dark.jpg", label: "Dashboard (dark)", cursor: "after hours" },
  { src: "/spothive/settings-1.jpg", label: "Settings", cursor: "your rules" },
  { src: "/spothive/settings-2.jpg", label: "Settings, expanded", cursor: "fine-tune" },
  { src: "/spothive/profile.jpg", label: "Profile (dark)", cursor: "that's you" },
];

const SEATMAP_SHOTS = [
  { src: "/spothive/book-a-spot-1.jpg", label: "Book a spot", cursor: "find a seat" },
  { src: "/spothive/book-a-spot-2.jpg", label: "The live seat map", cursor: "pick a seat" },
  { src: "/spothive/booking-details.jpg", label: "Booking details", cursor: "the details" },
  { src: "/spothive/seat-confirmation.jpg", label: "Seat confirmation", cursor: "you're in" },
];

// Three-screen hero preview (variety across the app: entry, home, the map).
const HERO_SHOTS = [
  { src: "/spothive/login-1.jpg", label: "Sign in", cursor: "get in" },
  { src: "/spothive/dashboard-1.jpg", label: "Dashboard", cursor: "your day" },
  { src: "/spothive/book-a-spot-2.jpg", label: "The live seat map", cursor: "pick a seat" },
];

const META = [
  { label: "Timeline", value: "One month" },
  { label: "Role", value: "Product Designer" },
  { label: "Company", value: "Sharp Corporation" },
  { label: "Scope", value: "30+ screens" },
];

// The four hard constraints of the brief, as design cards.
const CONSTRAINTS = [
  {
    name: "0-to-1",
    body: "No existing product to start from. The booking flow, the states, and the system all had to be designed from zero.",
  },
  {
    name: "One-month timeline",
    body: "Concept to shippable in about thirty days, alongside engineering, with no room for a slow ramp.",
  },
  {
    name: "Real-time states",
    body: "Every seat could be available, held, booked, or yours. The design had to make those states instantly legible.",
  },
  {
    name: "Global rollout",
    body: "It had to hold up across Sharp offices in different countries and floor plans, not just one pilot site.",
  },
];

// ---------------------------------------------------------------- helpers

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

// PhoneShot — a single portrait screen framed at its native ratio (no crop).
// Falls back to a labelled dashed placeholder if the image is missing.
function PhoneShot({
  src,
  label,
  cursorLabel,
}: {
  src: string;
  label: string;
  cursorLabel?: string;
}) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border bg-surface/40 shadow-sm"
      style={{ aspectRatio: PHONE_ASPECT }}
      data-cursor-label={cursorLabel}
    >
      {!errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
          <span
            className="font-mono text-caption-2 uppercase tracking-wide"
            style={{ color: "color-mix(in srgb, var(--accent) 75%, var(--color-muted))" }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

// StickyGallery — the two-panel section: text pinned on the left while the
// section's screens scroll past on the right. On mobile it collapses to a
// single column (text, then a 2-up grid of screens).
function StickyGallery({
  id,
  label,
  title,
  children,
  shots,
}: {
  id: string;
  label: string;
  title: React.ReactNode;
  children: React.ReactNode;
  shots: { src: string; label: string; cursor?: string }[];
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 px-6 py-8 sm:px-10 md:py-12 lg:pl-32 lg:pr-12"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
        {/* Left — sticky text. self-start + h-fit lets it pin while the taller
            image column scrolls past. */}
        <div className="md:sticky md:top-28 md:h-fit md:self-start">
          <Reveal>
            <Label>{label}</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">{title}</Statement>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-5 max-w-[52ch]">{children}</div>
          </Reveal>
        </div>

        {/* Right — the screens, scrolling. 2-up grid of native-ratio phones. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {shots.map((s, i) => (
            <Reveal key={s.src} delay={(i % 2) * 90} variant={i % 2 === 0 ? "left" : "right"}>
              <PhoneShot src={s.src} label={s.label} cursorLabel={s.cursor} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
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
    <section
      id={id}
      className={`scroll-mt-24 px-6 py-8 sm:px-10 md:py-12 lg:pl-32 lg:pr-12 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

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

export function SpotHiveCaseStudy() {
  const [active, setActive] = useState<string>("overview");
  const { resolvedTheme } = useTheme();
  const accent = resolvedTheme === "dark" ? ACCENT_DARK : ACCENT_LIGHT;

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
        {/* 1 — OVERVIEW + hero */}
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
                SpotHive
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p
                className="mt-4 max-w-[46ch] font-heading italic text-muted"
                style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)" }}
              >
                A 0-to-1 workspace booking product, shipped in a month and rolled
                out across Sharp&rsquo;s global offices.
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
              {/* Hero triptych — three native-ratio screens (entry, home, map). */}
              <div className="mx-auto grid max-w-2xl grid-cols-3 items-start gap-3 sm:gap-4">
                {HERO_SHOTS.map((s) => (
                  <PhoneShot key={s.src} src={s.src} label={s.label} cursorLabel={s.cursor} />
                ))}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <Body className="mt-10">
                Sharp&rsquo;s hybrid offices needed a way for employees to find and
                reserve desks and rooms across a hot-desking floor plan, and there
                was no existing product to start from. I designed SpotHive end to
                end: the booking flow, a component-based design system, and a live
                seat map with real-time availability, delivered in one month across
                30+ screens and deployed to Sharp offices worldwide.
              </Body>
            </Reveal>
          </div>
        </section>

        {/* 2 — CHALLENGE */}
        <Section id="challenge">
          <Reveal>
            <Label>the challenge</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Zero to shipped, in a month.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5 max-w-[62ch]">
              Hot-desking only works if people can see what&rsquo;s free right now
              and grab it in seconds. The brief was a product that didn&rsquo;t
              exist yet, on a one-month timeline, that had to hold up across offices
              in different countries and every possible seat state.
            </Body>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
            {CONSTRAINTS.map((c, i) => (
              <Reveal key={c.name} delay={i * 70} variant={i % 2 === 0 ? "left" : "right"}>
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
                    {c.name}
                  </p>
                  <Body className="mt-1">{c.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 3 — ONBOARDING (sticky text + login screens) */}
        <StickyGallery
          id="onboarding"
          label="getting in"
          title="Getting in, fast."
          shots={ONBOARDING_SHOTS}
        >
          <Body>
            Sign-in is the first screen and the easiest to overlook. I designed a
            quick, forgiving entry with a dark theme that holds up in a bright
            open-plan office, so people reach the booking flow in seconds instead
            of fighting a form.
          </Body>
        </StickyGallery>

        {/* 4 — SYSTEM (sticky text + dashboard / settings / profile) */}
        <StickyGallery
          id="system"
          label="the system"
          title="A component kit built to scale."
          shots={SYSTEM_SHOTS}
        >
          <Body>
            To move fast and stay consistent across 30+ screens, I built SpotHive
            on a component-based design system: booking cards, seat states,
            filters, and confirmation patterns as reusable parts. The dashboard,
            settings, and profile all assemble from the same pieces, in light and
            dark, so every surface agrees with the next.
          </Body>
        </StickyGallery>

        {/* 5 — SEAT MAP (sticky text + booking flow) */}
        <StickyGallery
          id="seatmap"
          label="the seat map"
          title="Availability you can read at a glance."
          shots={SEATMAP_SHOTS}
        >
          <Body>
            The core of SpotHive is a live seat map. Every seat carries a
            real-time state, available, held, booked, or yours, colour-coded so an
            employee can scan a floor and book in a couple of taps. Picking a seat
            opens the booking details; a clear confirmation closes the loop.
          </Body>
        </StickyGallery>

        {/* 5 — ROLLOUT */}
        <Section id="rollout">
          <Reveal>
            <Label>the outcome</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Deployed across Sharp&rsquo;s offices worldwide.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5 max-w-[62ch]">
              SpotHive shipped in a month and rolled out globally, giving Sharp
              employees one consistent way to find and book space in a hybrid
              workplace.
            </Body>
          </Reveal>
          <Reveal variant="fade" delay={200}>
            <p
              className="mt-16 font-mono text-caption-1 uppercase tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              Zero to one, in thirty days.
            </p>
          </Reveal>
        </Section>
      </div>
    </div>
  );
}
