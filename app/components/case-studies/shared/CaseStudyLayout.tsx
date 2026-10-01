"use client";

import { useEffect, useRef, useState } from "react";
import { accentVars, type ProjectAccentKey } from "@/app/lib/footprints";

/**
 * The one case-study template, lifted out of the 9and9 page (TempleCaseStudy)
 * once every project agreed to wear it.
 *
 * Before this, each case study carried its own private copy of the chrome and
 * the layout primitives, and they had drifted: three different column widths,
 * two different rails, heroes that disagreed about where the title sits. This
 * module owns the skeleton -- the centred FRAME_MAX_WIDTH axis, the section
 * rhythm, the dot rail, the progress bar, the grain, the reveal and count-up
 * motion, and the hero shape (eyebrow, title, intro, meta grid).
 *
 * What it deliberately does NOT own is a project's own material: its sections,
 * its images, and its bespoke set pieces (Feeld's aura, Onki's screens reel,
 * Handmade Homestead's tabs). Those stay in their own files and sit on top of
 * this skeleton.
 */

// Every text column and every full-bleed frame resolves to this same width, so
// a page reads as one column of art and copy rather than two competing grids.
export const FRAME_MAX_WIDTH = 1115;

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type SectionDef = { readonly id: string; readonly label: string };

// ---------------------------------------------------------------- type

export function Label({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : "text-left"}>
      <p className="font-apple text-eyebrow" style={{ color: "var(--accent)" }}>
        {children}
      </p>
    </div>
  );
}

// The one big line per section. Defaults to a 30ch measure; pass maxW="none"
// for a heading meant to run the full width of the column.
//
// `hand` swaps Ovo for Homemade Apple, which is not a font-family swap alone:
// the face has a much smaller x-height and hairline strokes, so at the h3 the
// serif is set at it reads a tier smaller than everything around it, and its
// long ascenders and descenders collide at 1.1 leading. The handwritten
// variant therefore carries its own size, leading and tracking — the same
// allowance --text-eyebrow already makes for this face elsewhere. It lives
// here rather than at the three call sites so the closer cannot drift between
// case studies.
export function Statement({
  children,
  className = "",
  maxW = "30ch",
  center = false,
  hand = false,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  maxW?: string;
  center?: boolean;
  /** Set the line in Homemade Apple rather than the heading serif. */
  hand?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      className={`${hand ? "font-apple leading-[1.4]" : "font-heading leading-[1.1]"} text-text ${center ? "text-center" : ""} ${className}`}
      style={{
        maxWidth: maxW,
        fontSize: hand ? "var(--text-h2)" : "var(--text-h3)",
        // Homemade Apple is already loose and joined; pulling it tighter
        // stacks the letters into each other.
        letterSpacing: hand ? "0" : "-0.01em",
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

export function Body({
  children,
  className = "",
  center = false,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <p
      className={`font-body font-normal leading-relaxed text-text ${center ? "text-center" : ""} ${className}`}
      style={{ fontSize: "var(--text-paragraph)" }}
    >
      {children}
    </p>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-border px-3 py-1 font-mono text-caption-2 uppercase tracking-wide text-muted">
      {children}
    </span>
  );
}

// Marker highlight. The wash sweeps left to right the first time the phrase
// scrolls into view. Painted as a background-image rather than a positioned box
// so it survives a line wrap (box-decoration-break clones it per line).
export function Mark({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.9 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span
      ref={ref}
      style={{
        backgroundImage: "linear-gradient(var(--highlight), var(--highlight))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 100%",
        backgroundSize: on ? "100% 92%" : "0% 92%",
        transition: "background-size 800ms cubic-bezier(0.22, 1, 0.36, 1)",
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
        padding: "0.05em 0.12em",
        margin: "0 -0.12em",
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- motion

export function Reveal({
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

export function CountUp({
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

export function GrainOverlay() {
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

export function SectionRail({
  sections,
  active,
  onJump,
}: {
  sections: readonly SectionDef[];
  active: string;
  onJump: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  // A single dot isn't navigation — a short study (Domu) has nowhere to jump.
  if (sections.length < 2) return null;
  return (
    <nav
      aria-label="Sections"
      className="fixed left-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3.5 md:flex"
    >
      {sections.map((s) => {
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
              className={`pointer-events-none absolute left-7 whitespace-nowrap font-mono text-caption-2 uppercase tracking-wide transition-all duration-300 ease-out motion-reduce:transition-none ${
                show ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
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

export function ProgressBar() {
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

// ---------------------------------------------------------------- layout

/**
 * Every text column sits on the same centred axis, and at the same width, as
 * the full-bleed frames: FRAME_MAX_WIDTH. Below xl the gutters keep the copy
 * off the screen edge; above it the column and the art line up exactly. There
 * is no left offset for the rail -- the rail floats over the gutter, and
 * shifting the column for it is what made the pages disagree.
 */
export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 py-12 ${className}`}>
      <div className="mx-auto w-full px-6 sm:px-10 xl:px-0" style={{ maxWidth: `${FRAME_MAX_WIDTH}px` }}>
        {children}
      </div>
    </section>
  );
}

/**
 * Anything that must run the full FRAME_MAX_WIDTH regardless of the column it
 * is written inside: motion clips, wide screenshots, full-bleed art. Breaks out
 * of the ancestor's max-w, then re-centres and caps itself at the same axis.
 */
export function Bleed({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative w-screen" style={{ left: "50%", marginLeft: "-50vw" }}>
      <div className={`relative mx-auto w-full ${className}`} style={{ maxWidth: `${FRAME_MAX_WIDTH}px` }}>
        {children}
      </div>
    </div>
  );
}

export function MotionFrame({
  src,
  title,
  className = "",
  aspectRatio = 16 / 9,
}: {
  src: string;
  title: string;
  className?: string;
  aspectRatio?: number;
}) {
  return (
    <Bleed>
      <div
        className={`relative w-full overflow-hidden ${className}`}
        style={{ aspectRatio, backgroundColor: "var(--bg)" }}
      >
        <iframe src={src} title={title} className="absolute inset-0 h-full w-full" loading="lazy" />
      </div>
    </Bleed>
  );
}

// ---------------------------------------------------------------- hero

export type MetaEntry = { label: string; value: string | string[]; href?: string };

/**
 * The opening of every case study, in one shape: an optional full-bleed lead
 * visual, then the project's name as a Homemade Apple eyebrow, the title, one paragraph
 * of intro, and the meta grid (timeline / role / team / tools).
 *
 * `title` is optional for a study whose lead visual already states its headline
 * (Domu's explainer opens on one), where an h1 under it would only repeat it.
 */
export function Hero({
  id = "overview",
  eyebrow,
  title,
  intro,
  meta,
  lead,
  leadCaption,
  children,
}: {
  id?: string;
  eyebrow: string;
  title?: React.ReactNode;
  intro: React.ReactNode;
  meta: readonly MetaEntry[];
  lead?: React.ReactNode;
  leadCaption?: React.ReactNode;
  // Anything a page wants to keep inside the hero column, below the meta grid
  // (Zuge closes its opening with a statement + paragraph).
  children?: React.ReactNode;
}) {
  return (
    // The lead variant opens on a full-bleed visual rather than type, so it
    // starts higher — but not above the nav, which is two rows tall below md.
    <section id={id} className={`scroll-mt-24 pb-8 ${lead ? "pt-28 md:pt-24" : "pt-36 md:pt-44"}`}>
      {lead ? <Reveal>{lead}</Reveal> : null}
      {leadCaption ? (
        <Reveal delay={60}>
          <p
            className="mx-auto mt-4 px-6 text-center font-mono text-caption-1 uppercase tracking-wide"
            style={{ maxWidth: `${FRAME_MAX_WIDTH}px`, color: "var(--accent)" }}
          >
            {leadCaption}
          </p>
        </Reveal>
      ) : null}

      <div className={lead ? "pt-14 sm:pt-16" : ""}>
        <div className="mx-auto w-full px-6 sm:px-10 xl:px-0" style={{ maxWidth: `${FRAME_MAX_WIDTH}px` }}>
          <Reveal delay={80}>
            <Label>{eyebrow}</Label>
            {title ? (
              <h1
                className="mt-4 font-display leading-[1.12] text-text"
                style={{ fontSize: "var(--text-h1)", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                {title}
              </h1>
            ) : null}
          </Reveal>
          <Reveal delay={170}>
            <Body className="mt-6">{intro}</Body>
          </Reveal>

          <Reveal delay={200}>
            <dl className="mt-12 grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-4">
              {meta.map((m) => {
                const lines = Array.isArray(m.value) ? m.value : [m.value];
                return (
                  <div key={m.label}>
                    <dt className="font-mono text-caption-1 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                      {m.label}
                    </dt>
                    <dd className="mt-3 font-body text-muted" style={{ fontSize: "var(--text-paragraph)" }}>
                      {lines.map((v) =>
                        m.href ? (
                          <a
                            key={v}
                            href={m.href}
                            target="_blank"
                            rel="noreferrer"
                            className="block underline decoration-1 underline-offset-4 transition-colors hover:[color:var(--accent)]"
                          >
                            {v}
                          </a>
                        ) : (
                          <span key={v} className="block">
                            {v}
                          </span>
                        ),
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Reveal>

          {children}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- frame

/**
 * The page wrapper: scopes the project's accent, lays down the grain, the dot
 * rail and the mobile progress bar, and tracks which section is in view.
 *
 * overflow-x-clip, not hidden: overflow-x-hidden would make this a scroll
 * container, which kills position:sticky for any pinned scene inside. clip
 * trims the w-screen breakouts the same way without that side effect.
 */
export function CaseStudyFrame({
  accent,
  sections,
  children,
  className = "",
}: {
  accent: ProjectAccentKey;
  sections: readonly SectionDef[];
  children: React.ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div
      className={`relative overflow-x-clip ${className}`}
      style={{ backgroundColor: "var(--bg)", ...accentVars(accent) }}
    >
      <GrainOverlay />
      <SectionRail sections={sections} active={active} onJump={jump} />
      <ProgressBar />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
