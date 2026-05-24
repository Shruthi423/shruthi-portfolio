"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { gsap, useGSAP } from "../lib/gsap";

/**
 * Feeld case study - uses the SAME template as Temple/Zuge/Kodif: a dot/glyph
 * section rail (the "index"), lowercase mono labels with the squiggle, Dahlia
 * display H1, EB Garamond serif section headings + pull-quotes, Figtree body.
 * Text is centred (Shruthi's call) on readable measures, while images and the
 * colour blocks fill the full frame width (the emmiwu.com/figma treatment).
 * Accent is Feeld's coral. Images live in /public/feeld/ (uploaded later -
 * placeholders render until then).
 */

const ACCENT_LIGHT = "#CF4B3B"; // coral-red, readable on morning mist
const ACCENT_DARK = "#F08C7E"; // lighter coral, readable on warm midnight

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "origin", label: "the feeling that started it" },
  { id: "made", label: "what we made" },
  { id: "app", label: "the app" },
  { id: "hard", label: "the hard part" },
  { id: "privacy", label: "privacy" },
  { id: "reflection", label: "reflection" },
] as const;

const META = [
  { label: "Timeline", value: "48 hours · FigBuild 2026" },
  { label: "Team", value: "Shruthi, Hyebin, Reet, Amulya" },
  { label: "Form", value: "Contact lens + wristband" },
  { label: "Tools", value: "Figma, Figma Make, Figma Slides, Claude" },
];

// The five live dimensions of a person's field. The aura colour is the whole
// point, so each gets its own glow.
const DIMENSIONS = [
  { name: "Vital", color: "#E5544A" },
  { name: "Open", color: "#2FA98E" },
  { name: "Charged", color: "#E8A33D" },
  { name: "Settled", color: "#3E7FD0" },
  { name: "Clear", color: "#7FB7C9" },
];

// Floating words that hover over other people, seen through the lens.
const GLOW_WORDS = [
  { word: "Steady", color: "#3E7FD0" },
  { word: "Electric", color: "#E8A33D" },
  { word: "Sharp", color: "#E5544A" },
  { word: "Open", color: "#2FA98E" },
];

const APP_SCREENS = [
  { name: "Aura", file: "feeld/screen-aura.jpg" },
  { name: "People", file: "feeld/screen-people.jpg" },
  { name: "Patterns", file: "feeld/screen-patterns.jpg" },
  { name: "Reflection", file: "feeld/screen-reflection.jpg" },
  { name: "Settings", file: "feeld/screen-settings.jpg" },
];

const APP_NOTES = [
  { name: "Aura", note: "Your own signal, breathing." },
  { name: "People", note: "Your network: each aura, and what they are carrying today." },
  { name: "Patterns", note: "Your energy over time, and what certain people do to it." },
  { name: "Reflection", note: "Completely private. A timeline only you ever see." },
];

const PRIVACY_LAYERS = ["Private", "Signal", "Close", "Open"];

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
    <div className="text-center">
      <p className="font-mono text-caption-1 lowercase tracking-[0.04em]" style={{ color: "var(--accent)" }}>{children}</p>
      <Squiggle className="mx-auto mt-1.5 block" />
    </div>
  );
}

function Statement({ children, className = "", maxW = "32ch" }: { children: React.ReactNode; className?: string; maxW?: string }) {
  return (
    <h2 className={`mx-auto text-center font-heading leading-[1.1] text-text ${className}`} style={{ maxWidth: maxW, fontSize: "clamp(1.9rem, 4vw, 3rem)", letterSpacing: "-0.01em" }}>
      {children}
    </h2>
  );
}

// Big serif pull-quote, same family as the section headings (matches the other
// case studies' pull moments).
function Pull({ children, className = "", maxW = "26ch" }: { children: React.ReactNode; className?: string; maxW?: string }) {
  return (
    <p className={`mx-auto text-center font-heading leading-[1.14] text-text ${className}`} style={{ maxWidth: maxW, fontSize: "clamp(1.7rem, 3.6vw, 2.7rem)", letterSpacing: "-0.01em" }}>
      {children}
    </p>
  );
}

function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mx-auto max-w-[60ch] text-center font-body leading-relaxed text-muted ${className}`} style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)" }}>
      {children}
    </p>
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
  variant?: "up" | "fade";
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
  const hidden = variant === "fade" ? "opacity-0" : "opacity-0 translate-y-8";
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : hidden} ${className}`}
    >
      {children}
    </div>
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
              className={`pointer-events-none absolute left-7 whitespace-nowrap rounded-md bg-surface px-2 py-0.5 font-mono text-caption-2 lowercase tracking-wide shadow-sm transition-all duration-200 ease-out ${
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

export function FeeldCaseStudy() {
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
              <h1 className="mx-auto max-w-[20ch] text-center font-display leading-[1.02] text-text" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Know yourself. Sense the room.
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mx-auto mt-4 max-w-[52ch] text-center font-heading italic text-muted" style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)" }}>
                A wearable sense for the thing you already feel in a room, but could never prove.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <dl className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-5 border-y border-border py-6">
                {META.map((m) => (
                  <div key={m.label} className="text-center">
                    <dt className="font-mono text-caption-2 uppercase tracking-wide text-muted">{m.label}</dt>
                    <dd className="mt-1 font-body text-body text-text">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {/* hero: the Aura screen, particle field breathing - full frame width */}
            <Reveal delay={200} variant="fade">
              <Figure
                src="/feeld/hero.jpg"
                file="feeld/hero.jpg"
                label="Aura home screen, particle field breathing"
                aspect="aspect-[16/9]"
                cursorLabel="your signal"
                className="mt-10"
              />
            </Reveal>

            <Reveal delay={120}>
              <Pull className="mt-12">
                You walk into a room and something is <span className="italic" style={{ color: "var(--accent)" }}>off</span>. Nobody said a word. You knew anyway.
              </Pull>
            </Reveal>
            <Reveal delay={180}>
              <Body className="mt-6">We wanted to build the thing that finally confirms what you already sense.</Body>
            </Reveal>
          </div>
        </section>

        {/* 2 - THE FEELING THAT STARTED IT */}
        <Section id="origin">
          <Reveal><Label>the feeling that started it</Label></Reveal>
          <Reveal delay={60}><Statement className="mt-5">Four of us, someone&rsquo;s kitchen, and a brief with no answer.</Statement></Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Pasta on the stove, ideas on a whiteboard, half a designathon brief and far too much energy for midnight. The brief: design a tool for a human sense that does not exist yet.
            </Body>
          </Reveal>
          <Reveal delay={140}>
            <Pull className="mt-10" maxW="28ch">
              What is the most invisible thing about being around other people? Not what they say. What they are actually <span className="italic" style={{ color: "var(--accent)" }}>carrying</span>.
            </Pull>
          </Reveal>
          <Reveal delay={120} variant="fade" className="mt-12">
            <Figure
              src="/feeld/lens-view.jpg"
              file="feeld/lens-view.jpg"
              label="Lens view: soft body glows over the card game"
              aspect="aspect-video"
              cursorLabel="through the lens"
            />
          </Reveal>
        </Section>

        {/* 3 - WHAT WE MADE */}
        <Section id="made">
          <Reveal><Label>what we made</Label></Reveal>
          <Reveal delay={60}><Statement className="mt-5">A contact lens and a wristband that read your energy field, live.</Statement></Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              feeld reads your biological energy in real time. Through the lens, you can sense others too, if they let you. The world looks almost the same, except every person now carries a soft colour glow, and one word floating above them.
            </Body>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-3">
              {GLOW_WORDS.map((g, i) => (
                <span key={g.word} className="font-heading italic" style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)", color: g.color, opacity: 0.6 + i * 0.1 }}>
                  {g.word}
                </span>
              ))}
            </div>
          </Reveal>

          {/* the five live dimensions, on a dark "lens" block - full frame width */}
          <Reveal variant="fade" className="mt-12">
            <div className="px-6 py-16 md:px-12 md:py-20" style={{ backgroundColor: "#171520" }}>
              <p className="text-center font-mono text-caption-2 uppercase tracking-[0.12em]" style={{ color: "#a39bb5" }}>Five live dimensions</p>
              <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-5 sm:gap-x-4">
                {DIMENSIONS.map((d) => (
                  <div key={d.name} className="flex flex-col items-center gap-4">
                    <span className="block h-12 w-12 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 34px 8px ${d.color}99` }} />
                    <span className="font-body text-body" style={{ color: "#eae0ce" }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}><Pull className="mt-12" maxW="24ch">Not a diagnosis. Just the <span className="italic" style={{ color: "var(--accent)" }}>truth</span> of what is in the room.</Pull></Reveal>
        </Section>

        {/* 4 - THE APP */}
        <Section id="app">
          <Reveal><Label>the app</Label></Reveal>
          <Reveal delay={60}><Statement className="mt-5">Five screens. One of them is the whole point.</Statement></Reveal>
          <Reveal delay={120}><Body className="mt-5">The particle aura is the interface. Everything else exists to get out of its way.</Body></Reveal>

          {/* the five screens - full frame width */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
            {APP_SCREENS.map((s, i) => (
              <Reveal key={s.name} delay={(i % 5) * 60}>
                <div>
                  <Figure src={`/${s.file}`} file={s.file} label={s.name} aspect="aspect-[9/19]" cursorLabel={s.name.toLowerCase()} />
                  <p className="mt-2 text-center font-mono text-caption-2 uppercase tracking-[0.1em] text-muted">{s.name}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* what each meaningful screen does */}
          <div className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {APP_NOTES.map((n, i) => (
              <Reveal key={n.name} delay={(i % 4) * 60}>
                <h3 className="text-center font-heading text-h4 leading-snug text-text">{n.name}</h3>
                <p className="mx-auto mt-2 max-w-[28ch] text-center font-body leading-relaxed text-muted" style={{ fontSize: "1rem" }}>{n.note}</p>
              </Reveal>
            ))}
          </div>

          {/* the patterns pull: what people do to your energy */}
          <div className="mt-14 flex flex-col items-center gap-8">
            <Reveal>
              <div className="w-full max-w-[200px]">
                <Figure src="/feeld/screen-patterns-people.jpg" file="feeld/screen-patterns-people.jpg" label="Patterns, People tab" aspect="aspect-[9/19]" cursorLabel="energy per person" />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <Pull maxW="22ch">James drops your <span style={{ color: "var(--accent)" }}>Settled</span> score 22% every time. Not his fault. Just true.</Pull>
            </Reveal>
          </div>
        </Section>

        {/* 5 - THE HARD PART */}
        <Section id="hard">
          <Reveal><Label>the hard part</Label></Reveal>
          <Reveal delay={60}><Statement className="mt-5">Every early version was too loud.</Statement></Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Labels, states, numbers, bars. We kept adding because we were nervous the concept would not land without explanation. It never landed with explanation.
            </Body>
          </Reveal>
          <Reveal delay={140}><Pull className="mt-10">The moment we stripped it back, one glow, one word, nothing else, it <span className="italic" style={{ color: "var(--accent)" }}>clicked</span>.</Pull></Reveal>
          <Reveal delay={180}>
            <Body className="mt-6">
              Good speculative UX does not over-justify itself. It shows you the experience and trusts you to feel it. That took us longer to learn than we would like to admit.
            </Body>
          </Reveal>
        </Section>

        {/* 6 - PRIVACY */}
        <Section id="privacy">
          <Reveal><Label>privacy</Label></Reveal>
          <Reveal delay={60}><Statement className="mt-5">Consent built into the interaction, not buried in a settings screen.</Statement></Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Four layers, from fully private to fully open. Go offline and you lose access to others&rsquo; signals too. Like read receipts, it works both ways.
            </Body>
          </Reveal>
          <Reveal delay={160}>
            <div className="relative mx-auto mt-14 max-w-xl">
              <div className="absolute left-0 right-0 top-1.5 h-px" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--color-muted) 55%, transparent), var(--accent))" }} />
              <div className="relative grid grid-cols-4">
                {PRIVACY_LAYERS.map((l, i) => (
                  <div key={l} className="flex flex-col items-center gap-3 text-center">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--bg)", border: "2px solid var(--accent)", opacity: 0.45 + i * 0.18 }} />
                    <span className="font-body text-body text-text">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Section>

        {/* 7 - REFLECTION */}
        <Section id="reflection">
          <Reveal><Label>reflection</Label></Reveal>
          <Reveal delay={60}><Statement className="mt-5" maxW="34ch">The most useful thing I built that weekend was not feeld.</Statement></Reveal>
          <Reveal delay={100}>
            <p className="mt-3 text-center font-mono text-caption-2 uppercase tracking-[0.12em]" style={{ color: "var(--accent)" }}>Shruthi</p>
          </Reveal>
          <Reveal delay={140}>
            <Body className="mt-6">
              It was the habit of asking: what is the minimum this needs to be to still feel true? We were making pasta at 1am, debating whether the particle aura needed labels or if the colour was enough. Amulya said just show it. Reet said nothing. Hyebin laughed. We showed it. It was enough.
            </Body>
          </Reveal>
          <Reveal delay={180}>
            <Body className="mt-5">
              That is the thing about speculative design. You cannot hide behind features that do not exist yet. The concept has to carry itself. The information architecture has to be felt, not explained.
            </Body>
          </Reveal>
          <Reveal variant="fade" delay={160} className="mt-14">
            <p className="mx-auto max-w-2xl text-center font-heading italic leading-[1.4] text-text" style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)" }}>
              I came in expecting to learn about sensors. I left knowing more about restraint.
            </p>
          </Reveal>
          <Reveal variant="fade" delay={220}>
            <p className="mt-10 text-center font-mono text-caption-1 lowercase tracking-[0.06em]" style={{ color: "var(--accent)" }}>
              feeld. know yourself. sense the room.
            </p>
          </Reveal>
        </Section>
      </div>
    </div>
  );
}
