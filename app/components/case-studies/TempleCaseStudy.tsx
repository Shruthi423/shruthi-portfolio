"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/components/shared/ThemeProvider";
import { gsap, useGSAP } from "@/app/lib/gsap";

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
  { id: "scope", label: "the scope" },
  { id: "voices", label: "in their words" },
  { id: "iterations", label: "what didn't work" },
  { id: "solution", label: "the solution" },
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

// The four screens of the booking flow. Rendered upright in PhoneStory,
// each with a step number, title, and one-line description.
const FLOW: PhoneScreen[] = [
  { src: "/temple/screens/book-calendar.png", caption: "01", label: "Choose date & service", body: "A traffic-light heatmap shows real-time slot availability at a glance.", cursor: "available / filling / sold out" },
  { src: "/temple/screens/book-form.png", caption: "02", label: "Enter details", body: "Basic info only, with auto-fill for returning pilgrims.", cursor: "the short form" },
  { src: "/temple/screens/book-confirm.png", caption: "03", label: "Review", body: "Dress code, rules, and visit details, confirmed before paying.", cursor: "read before you pay" },
  { src: "/temple/screens/book-pay.png", caption: "04", label: "Pay & download", body: "UPI, card, or net banking. The QR ticket generates offline.", cursor: "works on 2G" },
];

// The two faces of the home: services-first and live-content-first. Anchors
// the visual story before the booking flow.
const HOMES: PhoneScreen[] = [
  { src: "/temple/screens/home-1.png", label: "Devotee Services", body: "Darshanam, Pratyaksha & Paroksha Seva, Accommodation, surfaced as cards.", cursor: "the entry point" },
  { src: "/temple/screens/home-2.png", label: "Live + Trending", body: "Srisaila TV live darshan, Vedic content, with the same service rail beneath.", cursor: "above the fold, the second state" },
];

// Meenakshi anchors the turning point, so the wall holds the other six.
const VOICES = [
  { name: "Raghava", meta: "72 · Local veteran", img: "/temple/users/raghava.jpg", quote: "At my age, I need someone to help me book online and with my wheelchair. These new technologies are so confusing for me." },
  { name: "Tulasi", meta: "34 · Housewife", img: "/temple/users/tulasi.jpg", quote: "I can't tell if my booking was successful or failed because everything is in red and green. I never know if there are tickets available." },
  { name: "Aruna", meta: "57 · Local pilgrim", img: "/temple/users/aruna.jpg", quote: "I visit every month, but during festivals it's impossible to get tickets. We regulars should have some priority." },
  { name: "Sastry", meta: "62 · Priest coordinator", img: "/temple/users/sastry.jpg", quote: "Coordinating multiple special ceremonies is complex enough, and now I have to manage everything through this new digital system." },
  { name: "Parvathi", meta: "47 · Customer service", img: "/temple/users/parvathi.jpg", quote: "During peak seasons I'm overwhelmed with queries. I need faster access to booking details to help everyone." },
  { name: "Gopinath", meta: "57 · Security agent", img: "/temple/users/gopinath.jpg", quote: "These fake tickets are harder to spot. We need a faster way to verify, especially across multiple entrances." },
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

// The shipped solution's traffic-light statuses, rendered as real pills.
const TRAFFIC = [
  { label: "Available", color: "#2f9e44" },
  { label: "Filling Fast", color: "#e0a106" },
  { label: "Sold Out", color: "#d63a3a" },
];

// The platform I owned, grouped by area for the tabbed solution showcase.
// `tall` screens (full-page captures) sit in fixed-height scroll frames;
// wide 16:9 admin screens render in full.
const SOLUTION_TABS = [
  {
    tab: "Booking flow",
    blurb: "End to end: pick a slot, check out, keep the record, the one job that mattered.",
    cols: "sm:grid-cols-3",
    // Render each screen at its natural aspect (no scroll frame), so the
    // near-square booking-history shows fully alongside the taller two.
    tall: false,
    screens: [
      { img: "/temple/wireframes/booking-darshanam.jpg", label: "01 · Book a darshanam", cursor: "pick a date + slot" },
      { img: "/temple/wireframes/booking-cart.jpg", label: "02 · Cart & payment", cursor: "review + pay" },
      { img: "/temple/wireframes/booking-history.jpg", label: "03 · Booking history", cursor: "the record" },
    ],
  },
  {
    tab: "Inventory",
    blurb: "Slots, capacity, and cut-off windows, configurable per service.",
    cols: "sm:grid-cols-2",
    tall: false,
    screens: [
      { img: "/temple/wireframes/inventory-slots.jpg", label: "Manage slots", cursor: "the slot inventory" },
      { img: "/temple/wireframes/inventory-add-slot.jpg", label: "Configure a slot", cursor: "caps + cut-off rules" },
    ],
  },
  {
    tab: "Service",
    blurb: "Darshanam types, pricing, and per-service booking caps.",
    cols: "",
    tall: false,
    screens: [
      { img: "/temple/wireframes/service-darshanam.jpg", label: "Manage darshanam services", cursor: "types + pricing" },
    ],
  },
  {
    tab: "Employment",
    blurb: "Staffed POS counters, each with its own daily limits.",
    cols: "",
    tall: false,
    screens: [
      { img: "/temple/wireframes/employment-pos.jpg", label: "Counter / POS management", cursor: "the counters" },
    ],
  },
  {
    tab: "Dashboard",
    blurb: "Revenue, bookings, and registered users across every service.",
    cols: "",
    tall: true,
    screens: [
      { img: "/temple/wireframes/dashboard.jpg", label: "Admin dashboard", cursor: "the overview" },
    ],
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

// The nine modules inside the Devotees Portal, the surface I designed
// most deeply for. Rendered natively as a 3x3 map in the approach section,
// in place of the original wheel diagram.
const DEVOTEES_MODULES = [
  { n: "01", title: "Bookings", note: "darshans, sevas, accommodation" },
  { n: "02", title: "Donations", note: "e-Hundi, AnnaPrasadam, GoSamrakshana" },
  { n: "03", title: "e-Store", note: "prasadam, publications, products" },
  { n: "04", title: "Streaming", note: "Paroksha Seva live, festivals" },
  { n: "05", title: "Media Room", note: "events, daily updates, press" },
  { n: "06", title: "Volunteer", note: "queue + AnnaPrasadam service" },
  { n: "07", title: "Temple Trivia", note: "gallery, mythology, history" },
  { n: "08", title: "Support", note: "24/7 info, ticketing, live chat" },
  { n: "09", title: "Devotee Mgmt", note: "profile, history, settings" },
];

// The four portals I designed across. Pulled from the scope-of-work deck.
// One ecosystem, four surfaces, each with its own audience and job.
const SCOPE_PORTALS = [
  {
    n: "01",
    title: "Guest Portal",
    audience: "Public, no login",
    body: "Discovery surface: temple info, sevas, donations, online booking, media room. The way most people first meet the platform.",
  },
  {
    n: "02",
    title: "Devotees Portal",
    audience: "Logged-in pilgrims",
    body: "Booking history, e-store, streaming, devotee management. Where a one-time visitor becomes a returning user.",
  },
  {
    n: "03",
    title: "Temple Management",
    audience: "Per-temple staff",
    body: "Profiling, pilgrim services, assets, inventory, accounts. Each temple runs its own operation through this.",
  },
  {
    n: "04",
    title: "Endowments Portal",
    audience: "Department-level",
    body: "The rollup. Revenue, audits, MIS reports across all temples under AP Endowments.",
  },
];

// The eighteen services I designed admin tooling for, beyond ticket booking.
// Lifted from the management-system service list. Sequence preserves the
// deck's grouping (rituals → access → utilities) so it reads as a tour.
const SERVICE_BREADTH = [
  "Sevas",
  "Darshanam",
  "Accommodation",
  "Prasadam",
  "Donations",
  "Publications",
  "Products",
  "Tulabharam",
  "Kalyana Katta",
  "Tollgate",
  "Parking",
  "Kalyan Mandapam",
  "Rents & Lease",
  "Revenue (hair, coconut, rice)",
  "Petrol Bunk",
  "Gas",
  "Water",
  "Electricity",
];

// Empathy map for the primary pilgrim persona. Phrases lifted verbatim
// from the research artifact, condensed to the strongest few per quadrant.
const EMPATHY = [
  {
    q: "Think",
    items: ["Why is this so hard?", "This is taking too long.", "Such an outdated process.", "This is inconvenient."],
  },
  {
    q: "Do",
    items: ["Wait in line for hours", "Cut the line", "Use third-party agents", "Argue with security"],
  },
  {
    q: "Feel",
    items: ["Overwhelmed", "Confused", "Impatient", "Irritated", "Nervous", "Unimpressed"],
  },
  {
    q: "Say",
    items: ["“I wish this was simpler.”", "“This could be online.”", "Hesitates to mention problems", "Waits reluctantly"],
  },
];

// Two hard-earned lessons. Rendered as full-width editorial rows with a
// big accent numeral on the left and the lesson + body in the gutter.
const REFLECTIONS = [
  {
    n: "01",
    lesson: "Scope discipline ships products.",
    body: "Saying no is hardest with the features you believed in. We cut the upsells to protect the one thing pilgrims came for: the darshan ticket.",
  },
  {
    n: "02",
    lesson: "Staff experience is the user experience.",
    body: "A confused staff member at the gate undoes everything a smooth booking flow built. Operations should be in the room from week one.",
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
  // "cover" crops to fill the aspect frame; "contain" letterboxes so the
  // whole image is visible. When "contain", parallax/scale is skipped
  // since zooming a fitted image would push it beyond the frame.
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

/**
 * Tabbed showcase of the platform I owned: one tab per area (booking flow,
 * inventory, service, employment, dashboard). The booking tab shows the flow
 * as a numbered 1-2-3 sequence; the others show their screen(s). Full-page
 * captures sit in fixed-height scroll frames; wide admin screens render full.
 * Left/right arrows move between tabs.
 */
function SolutionTabs() {
  const [active, setActive] = useState(0);
  const t = SOLUTION_TABS[active];
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setActive((i) => (i + 1) % SOLUTION_TABS.length);
    if (e.key === "ArrowLeft") setActive((i) => (i - 1 + SOLUTION_TABS.length) % SOLUTION_TABS.length);
  };
  return (
    <div>
      <div role="tablist" aria-label="Platform areas I owned" onKeyDown={onKey} className="flex flex-wrap gap-2">
        {SOLUTION_TABS.map((s, idx) => {
          const on = idx === active;
          return (
            <button
              key={s.tab}
              role="tab"
              type="button"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(idx)}
              data-cursor-label={on ? undefined : s.tab.toLowerCase()}
              className={
                on
                  ? "rounded-full bg-text px-4 py-1.5 font-mono text-caption-2 uppercase tracking-wide text-bg transition-colors"
                  : "rounded-full border border-border px-4 py-1.5 font-mono text-caption-2 uppercase tracking-wide text-muted transition-colors hover:border-text/40 hover:text-text"
              }
            >
              {s.tab}
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-body text-muted" style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)" }}>{t.blurb}</p>

      <div className={`mt-5 grid grid-cols-1 gap-4 ${t.cols}`}>
        {t.screens.map((sc) => (
          <figure key={sc.img}>
            {t.tall ? (
              <div className="overflow-hidden rounded-lg border border-border" style={{ backgroundColor: "var(--bg)" }}>
                <div className="h-[440px] overflow-y-auto overscroll-contain" data-cursor-label={sc.cursor}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sc.img} alt={sc.label} className="block w-full" />
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border" style={{ backgroundColor: "var(--bg)" }} data-cursor-label={sc.cursor}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sc.img} alt={sc.label} className="block w-full" />
              </div>
            )}
            <figcaption className="mt-2 font-mono text-caption-2 uppercase tracking-wide text-muted">{sc.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- phone story panel
// Two-panel scroll story, matching the Framer portfolio's pattern:
//
//   LEFT (sticky)              RIGHT (scrolling)
//   eyebrow                    [phone 1]
//   title                      caption, label, body
//   body                       [phone 2]
//                              ...
//
// Mobile: collapses to single column, info on top, phones below.
// Visual: upright phones, no card/gradient behind, just the phone on the page.
// Used for any "walk through the screens" moment in the case study.

type PhoneScreen = {
  src: string;
  caption?: string;   // small eyebrow above label (e.g. step number)
  label?: string;     // bolded title under the phone
  body?: string;      // optional one-line description below the label
  cursor?: string;
};

function PhoneStory({
  eyebrow,
  title,
  body,
  screens,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  screens: PhoneScreen[];
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-[0.55fr_1fr] lg:gap-14">
      {/* LEFT: info panel, sticky at desktop sizes */}
      <div>
        <div className="lg:sticky lg:top-24">
          {eyebrow && (
            <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              {eyebrow}
            </p>
          )}
          <h3
            className="mt-3 font-heading leading-tight text-text"
            style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)", letterSpacing: "-0.01em" }}
          >
            {title}
          </h3>
          {body && (
            <p className="mt-5 font-body leading-relaxed text-muted" style={{ fontSize: "1rem" }}>
              {body}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT: phones stacked, upright, no background */}
      <div className="flex flex-col gap-16 sm:gap-20">
        {screens.map((s) => (
          <figure key={s.src} className="flex flex-col items-center">
            <div className="w-full max-w-[480px]" data-cursor-label={s.cursor}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.label ?? ""} className="block w-full" />
            </div>
            {(s.caption || s.label || s.body) && (
              <figcaption className="mt-5 w-full max-w-[480px] text-center">
                {s.caption && (
                  <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                    {s.caption}
                  </p>
                )}
                {s.label && (
                  <p className="mt-1 font-heading leading-snug text-text" style={{ fontSize: "1.05rem" }}>
                    {s.label}
                  </p>
                )}
                {s.body && (
                  <p className="mt-2 font-body leading-relaxed text-muted" style={{ fontSize: "0.85rem" }}>
                    {s.body}
                  </p>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
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
              <p className="mt-4 whitespace-nowrap font-heading italic text-muted" style={{ fontSize: "clamp(0.59rem, 2.85vw, 1.6rem)" }}>
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
                src="/temple/hero.jpg"
                file="temple/hero.jpg"
                label="Hero: Srisailam booking app"
                aspect="aspect-[4/3] sm:aspect-[3/2]"
                fit="contain"
                parallax={false}
              />
            </Reveal>

            <Reveal delay={120}>
              <p
                className="mt-12 whitespace-nowrap font-heading leading-[1.12] text-text"
                style={{ fontSize: "clamp(0.6rem, 3vw, 2.6rem)", letterSpacing: "-0.01em" }}
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
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.62rem, 3.1vw, 2.7rem)" }}>Every ticket was bought in person, on the day, in a 3 to 6 hour queue.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Srisailam is one of 23,000+ temples under AP Endowments, and one of the most heavily trafficked. The crowd-management landscape around it was a patchwork of half-solutions, and none of them fixed the queue.
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
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>Three problems.</Statement>
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
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>What I owned, and the routes we ruled out.</Statement>
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
                <dl className="mt-8 flex flex-col gap-5">
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
              {/* native module map: the 9 surfaces of the Devotees Portal,
                  rendered as a labelled 3x3 grid with accent numerals and a
                  centre title strip. Replaces the original wheel diagram. */}
              <div
                className="relative overflow-hidden border border-border p-5 sm:p-7"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent) 6%, var(--bg))",
                  backgroundImage:
                    "radial-gradient(circle at 50% 38%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 62%)",
                }}
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                    Devotees Portal
                  </p>
                  <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">9 modules</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-px border border-border bg-border">
                  {DEVOTEES_MODULES.map((m) => (
                    <div
                      key={m.n}
                      className="flex flex-col gap-1.5 p-3.5 sm:p-4"
                      style={{ backgroundColor: "var(--bg)" }}
                    >
                      <span
                        className="font-mono text-caption-2 tabular-nums"
                        style={{ color: "var(--accent)", letterSpacing: "0.02em" }}
                      >
                        {m.n}
                      </span>
                      <h4 className="font-heading leading-tight text-text" style={{ fontSize: "0.95rem" }}>
                        {m.title}
                      </h4>
                      <p className="font-body leading-snug text-muted" style={{ fontSize: "0.72rem" }}>
                        {m.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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

        {/* 4.5 - THE SCOPE (four portals, one ecosystem) */}
        <Section id="scope">
          <Reveal>
            <Label>the scope</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>Four portals, one ecosystem.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              The platform shipped as four interlocked surfaces. Each had a different audience and a different job, but they shared one source of truth.
            </Body>
          </Reveal>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2">
            {SCOPE_PORTALS.map((p, i) => (
              <Reveal key={p.title} delay={i * 70} className="h-full">
                <div className="flex h-full flex-col gap-3 p-8" style={{ backgroundColor: "var(--bg)" }}>
                  <div className="flex items-center gap-3">
                    <span className="font-display" style={{ color: "var(--accent)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>
                      {p.n}
                    </span>
                    <span className="font-mono text-caption-2 uppercase tracking-wide text-muted">{p.audience}</span>
                  </div>
                  <h3 className="font-heading text-h4 leading-snug text-text">{p.title}</h3>
                  <Body className="!max-w-none">{p.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 5 - IN THEIR WORDS */}
        <Section id="voices">
          <Reveal>
            <Label>in their words</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>Before six personas, every pilgrim&rsquo;s view.</Statement>
          </Reveal>

          {/* empathy map: what every pilgrim thinks, does, feels, says */}
          <Reveal delay={100} className="mt-12">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">the empathy map</p>
          </Reveal>
          <div className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {EMPATHY.map((e, i) => (
              <Reveal key={e.q} delay={i * 60}>
                <div className="flex h-full flex-col gap-4 p-6" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>{e.q}</p>
                  <ul className="flex flex-col gap-2">
                    {e.items.map((it) => (
                      <li key={it} className="font-body text-caption-1 leading-relaxed text-text">{it}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          {/* the six personas the map pointed to */}
          <Reveal delay={100} className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">the six personas it shaped</p>
          </Reveal>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {VOICES.map((v, i) => (
              <Reveal key={v.name} delay={(i % 3) * 70}>
                <figure className="flex h-full flex-col border border-border p-7" style={{ backgroundColor: "var(--bg)" }}>
                  <blockquote className="mb-5 font-heading leading-snug text-text" style={{ fontSize: "1.15rem" }}>
                    &ldquo;{v.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.img}
                      alt={v.name}
                      className="h-[52px] w-[52px] shrink-0 rounded-full border border-border object-cover"
                    />
                    <div>
                      <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>{v.name}</p>
                      <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">{v.meta}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 6 - WHAT DIDN'T WORK */}
        <Section id="iterations">
          <Reveal>
            <Label>what didn&rsquo;t work</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>Three crowd-control ideas failed before one stuck.</Statement>
          </Reveal>
          {/* the three failed attempts, de-emphasised into a compact 3-up */}
          <Reveal delay={100}>
            <p className="mt-12 font-mono text-caption-2 uppercase tracking-wide text-muted">What we tried</p>
          </Reveal>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {ITERATIONS.filter((it) => it.status === "failed").map((it, i) => (
              <Reveal key={it.n} delay={i * 70}>
                <div className="flex h-full flex-col gap-2 border border-border p-5" style={{ backgroundColor: "var(--bg)" }}>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-muted" style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>{it.n}</span>
                    <span className="font-mono text-caption-2 uppercase tracking-wide text-muted">✕ didn&rsquo;t work</span>
                  </div>
                  <h3 className="font-heading leading-snug text-text/75" style={{ fontSize: "1.1rem" }}>{it.title}</h3>
                  <p className="font-body text-caption-1 leading-relaxed text-muted">{it.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* the one that stuck, emphasised: full-width accent hero with the
              actual shipped traffic-light statuses as pills */}
          {ITERATIONS.filter((it) => it.status === "shipped").map((it) => (
            <Reveal key={it.n} delay={120} variant="scale">
              <div className="mt-8">
                <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>What stuck</p>
                <div
                  className="mt-4 border-2 p-7 sm:p-9"
                  style={{ borderColor: "var(--accent)", backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--bg))" }}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
                    <span className="font-display shrink-0" style={{ color: "var(--accent)", fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1 }}>{it.n}</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-heading leading-tight text-text" style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)" }}>{it.title}</h3>
                        <span className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>✓ shipped</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {TRAFFIC.map((t) => (
                          <span
                            key={t.label}
                            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-caption-2 uppercase tracking-wide text-text"
                            style={{
                              borderColor: `color-mix(in srgb, ${t.color} 45%, transparent)`,
                              backgroundColor: `color-mix(in srgb, ${t.color} 12%, transparent)`,
                            }}
                          >
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                            {t.label}
                          </span>
                        ))}
                      </div>
                      <Body className="mt-4 !max-w-none">{it.body}</Body>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </Section>

        {/* 7 - THE SOLUTION (with the Meenakshi turning point) */}
        <Section id="solution">
          <Reveal>
            <Label>the solution</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>Build something worthy of 20 years of faith.</Statement>
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

          {/* the home, two states - sticky intro left, phones stacked right */}
          <Reveal delay={120} className="mt-14">
            <PhoneStory
              eyebrow="the home"
              title="Two states, one shelf."
              body="Service-first when pilgrims came to plan, live-content-first when they came to watch. The same persistent service rail anchors the bottom either way."
              screens={HOMES}
            />
          </Reveal>

          {/* the four-step booking flow - sticky intro left, 4 phones right */}
          <Reveal delay={120} className="mt-20">
            <PhoneStory
              eyebrow="the booking flow"
              title="Four steps to a darshan ticket."
              body="Date and slot, personal details, review the rules, pay. The whole booking was built to survive 2G and to forgive the first-time digital user. The QR ticket generates before payment even confirms."
              screens={FLOW}
            />
          </Reveal>

          {/* the breadth of services the platform managed, beyond darshanam */}
          <Reveal delay={80} className="mt-16">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">eighteen services, one platform</p>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-3">
              Booking a darshan was the front door. Behind it, the admin tooling I designed managed every revenue stream and asset class the temple ran.
            </Body>
          </Reveal>
          <Reveal delay={150} className="mt-5">
            <div className="flex flex-wrap gap-2">
              {SERVICE_BREADTH.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 font-mono text-caption-2 uppercase tracking-wide text-text"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent) 6%, var(--bg))" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </Reveal>

          {/* the platform behind the flow: the breadth I owned, end to end */}
          <Reveal delay={80} className="mt-16">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">the platform I owned, end to end</p>
          </Reveal>
          <Reveal delay={120} className="mt-5">
            <SolutionTabs />
          </Reveal>
        </Section>

        {/* 8 - THE OUTCOME */}
        <Section id="outcome">
          <Reveal>
            <Label>the outcome</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 whitespace-nowrap" style={{ fontSize: "clamp(0.85rem, 4.3vw, 3rem)" }}>From a free pilot to a statewide platform.</Statement>
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
          {/* two lessons as wide editorial rows: big numeral, lesson title in
              accent, body in the gutter. Top & bottom hairlines for rhythm. */}
          <div className="mt-12 border-t border-border">
            {REFLECTIONS.map((r, i) => (
              <Reveal key={r.n} delay={i * 80}>
                <div
                  className="grid grid-cols-1 gap-4 border-b border-border py-9 sm:grid-cols-[auto_1fr] sm:gap-10 sm:py-12"
                >
                  <span
                    className="font-display tabular-nums sm:w-24"
                    style={{
                      color: "var(--accent)",
                      fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                      fontWeight: 700,
                      lineHeight: 0.9,
                    }}
                  >
                    {r.n}
                  </span>
                  <div>
                    <h3
                      className="font-heading leading-tight text-text"
                      style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
                    >
                      {r.lesson}
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
