"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/app/lib/gsap";
import {
  Bleed,
  Body,
  CaseStudyFrame,
  CountUp,
  Hero,
  Label,
  Pill,
  prefersReduced,
  Reveal,
  Section,
  Statement,
} from "@/app/components/case-studies/shared/CaseStudyLayout";

/**
 * Kodif case study - same editorial template, tuned for a brand + growth-design
 * story: a brand-product gap, the challenges, a wall of growth collateral, the
 * design principles, and the impact. Accent is a Kodif magenta (the product's
 * own brand is black + orange/pink/yellow). Images live in /public/kodif/.
 */


// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "why", label: "why a redesign" },
  { id: "challenges", label: "the challenges" },
  { id: "work", label: "the work" },
  { id: "guidelines", label: "brand guidelines" },
  { id: "principles", label: "principles" },
  { id: "outcome", label: "the outcome" },
] as const;

const META: { label: string; value: string; href?: string }[] = [
  { label: "Role", value: "Product Designer (Intern)" },
  { label: "Mentor", value: "Marcos Moreira, Lead Product Designer" },
  { label: "Team", value: "Growth & Product Design" },
  { label: "When", value: "Summer 2025 · Palo Alto, CA" },
  { label: "Live", value: "kodif.ai", href: "https://kodif.ai/" },
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
];

// The site's feature block, one reusable component with four capability states.
const FEATURES = [
  { tab: "AI Concierge", img: "/kodif/feature-concierge.jpg", headline: "Increase conversions with AI-powered product discovery", alt: "AI Concierge feature block: increase conversions with AI-powered product discovery" },
  { tab: "AI Agent", img: "/kodif/feature-agent.jpg", headline: "Fewer escalations, faster resolutions", alt: "AI Agent feature block: fewer escalations, faster resolutions" },
  { tab: "AI Analyst", img: "/kodif/feature-analyst.jpg", headline: "Turn interactions into feedback", alt: "AI Analyst feature block: turn interactions into feedback" },
  { tab: "AI Manager", img: "/kodif/feature-manager.jpg", headline: "Turn insights into actions", alt: "AI Manager feature block: turn insights into actions" },
];

// Revised brand guidelines, rebuilt natively from the source token sheets.
// Hex values sampled straight from Core colors.png so swatches are exact.
const NEUTRALS = [
  { name: "white", hex: "#ffffff" },
  { name: "50", hex: "#f1f1f1" },
  { name: "100", hex: "#ebeeee" },
  { name: "200", hex: "#d4d9d9" },
  { name: "300", hex: "#c0c8c7" },
  { name: "400", hex: "#859693" },
  { name: "500", hex: "#687976" },
  { name: "600", hex: "#52615f" },
  { name: "700", hex: "#434e4d" },
  { name: "800", hex: "#394241" },
  { name: "900", hex: "#323938" },
  { name: "950", hex: "#222626" },
  { name: "black", hex: "#000000" },
];

const HUES = [
  { name: "Blue", step: "500", hex: "#149bfa" },
  { name: "Red", step: "500", hex: "#ef4444" },
  { name: "Orange", step: "500", hex: "#ff6105" },
  { name: "Amber", step: "500", hex: "#f59e0b" },
  { name: "Green", step: "500", hex: "#22c55e" },
  { name: "Pink", step: "500", hex: "#fb39c4" },
  { name: "Lime", step: "300", hex: "#ecfb55" },
];

// Semantic roles → the core token each resolves to (from Semantic.png).
const SEMANTIC = [
  { role: "Text", token: "gray/950", hex: "#222626" },
  { role: "Action", token: "orange/600", hex: "#f04c06" },
  { role: "Info", token: "blue/600", hex: "#1278d6" },
  { role: "Accent", token: "pink/700", hex: "#cd0986" },
  { role: "Success", token: "green/700", hex: "#15803d" },
  { role: "Warning", token: "amber/700", hex: "#b45309" },
  { role: "Error", token: "red/600", hex: "#dc2626" },
  { role: "Muted", token: "gray/400", hex: "#859693" },
  { role: "Border", token: "gray/100", hex: "#ebeeee" },
  { role: "BG warm", token: "orange/25", hex: "#fbf9f8" },
];

const RADII = [
  { name: "DEFAULT", px: 4 },
  { name: "lg", px: 8 },
  { name: "xl", px: 12 },
  { name: "2xl", px: 16 },
  { name: "3xl", px: 24 },
  { name: "full", px: 999 },
];

// Type specimens. Kodif's real fonts (TWK Lausanne / Inter / SF Mono) aren't
// loaded here, so headings + body render in Figtree as a sans stand-in and the
// mono row in a generic monospace; each row is labelled with the real spec.
const TYPE_SCALE = [
  { name: "Heading / 5xl", spec: "TWK Lausanne · 400 · 36/48", size: 36, lh: 48, mono: false, sample: "Human touch." },
  { name: "Heading / 3xl", spec: "TWK Lausanne · 500 · 24/32", size: 24, lh: 32, mono: false, sample: "Superhuman speed." },
  { name: "Heading / xl", spec: "TWK Lausanne · 500 · 18/22", size: 18, lh: 22, mono: false, sample: "Get the story behind the stats." },
  { name: "Body / base", spec: "Inter · Medium · 14/20", size: 14, lh: 20, mono: false, sample: "In your customer's corner, every step of the way." },
  { name: "Body / sm", spec: "Inter · Medium · 12/16", size: 12, lh: 16, mono: false, sample: "Smarter conversations. Happier customers." },
  { name: "Body / mono", spec: "SF Mono · Regular · 14/16", size: 14, lh: 16, mono: true, sample: "kodif.ai" },
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

// ---------------------------------------------------------------- helpers

function SiteBrowser({ src, alt, url = "kodif.ai" }: { src: string; alt: string; url?: string }) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border shadow-lg" style={{ backgroundColor: "var(--bg)" }}>
        {/* chrome bar */}
        <div className="flex items-center gap-3 border-b border-border px-3 py-2.5 sm:px-4">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-text/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-text/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-text/15" />
          </div>
          <div className="hidden flex-1 truncate rounded-md bg-text/5 px-3 py-1 text-center font-mono text-caption-2 text-muted sm:block">
            {url}
          </div>
        </div>

        <div className="relative h-[60vh] overflow-hidden sm:h-[68vh]" data-cursor-label="scroll to explore">
          <div className="absolute inset-0 overflow-y-auto overscroll-contain">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="block w-full" />
          </div>
        </div>
      </div>
      <p className="mt-3 font-body text-caption-1 text-muted">
        Scroll within the window to explore the full page.
      </p>
    </div>
  );
}

/**
 * The site's feature block as one switchable component: a row of capability
 * tabs (Concierge / Agent / Analyst / Manager) crossfades the matching screen
 * below. Mirrors how the live site behaves and shows the work shipped as a
 * reusable pattern, not four one-off pages. Left/right arrows move between tabs.
 */
function FeatureTabs() {
  const [active, setActive] = useState(0);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setActive((i) => (i + 1) % FEATURES.length);
    if (e.key === "ArrowLeft") setActive((i) => (i - 1 + FEATURES.length) % FEATURES.length);
  };
  return (
    <div>
      <div role="tablist" aria-label="Website feature components" onKeyDown={onKey} className="flex flex-wrap gap-2">
        {FEATURES.map((f, idx) => {
          const on = idx === active;
          return (
            <button
              key={f.tab}
              role="tab"
              type="button"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(idx)}
              data-cursor-label={on ? undefined : f.tab.toLowerCase()}
              className={
                on
                  ? "rounded-full bg-text px-4 py-1.5 font-mono text-caption-2 uppercase tracking-wide text-bg transition-colors"
                  : "rounded-full border border-border px-4 py-1.5 font-mono text-caption-2 uppercase tracking-wide text-muted transition-colors hover:border-text/40 hover:text-text"
              }
            >
              {f.tab}
            </button>
          );
        })}
      </div>
      <div
        className="relative mt-5 aspect-[45/32] w-full overflow-hidden rounded-lg border border-border"
        style={{ backgroundColor: "var(--bg)" }}
        role="region"
        aria-label={`${FEATURES[active].tab}: ${FEATURES[active].headline}`}
        data-cursor-label="the live component"
      >
        {FEATURES.map((f, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={f.tab}
            src={f.img}
            alt={f.alt}
            aria-hidden={idx !== active}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out ${
              idx === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
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

// ---------------------------------------------------------------- page

export function KodifCaseStudy() {
  return (
    <CaseStudyFrame accent="kodif" sections={SECTIONS}>
      <Hero
        eyebrow="Kodif"
        title="Shaping an AI concierge for e-commerce."
        intro={
          <>
            Kodif&rsquo;s product had outgrown its brand. I redesigned the website and built the growth assets to close
            the gap.
          </>
        }
        meta={META}
        lead={
          // product walkthrough: the agent surfacing answers across the
          // Surface/Assess/Enrich/Route/Act flow. Auto-loops, muted.
          <Bleed>
            <div
              className="relative w-full overflow-hidden border border-border aspect-[16/9]"
              style={{ backgroundColor: "var(--bg)" }}
              data-cursor-label="website in action"
            >
              <video
                src="/kodif/agent-in-action.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="The Kodif agent surfacing answers across the Surface, Assess, Enrich, Route, Act flow"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </Bleed>
        }
      >
        <Reveal delay={240}>
          <Statement maxW="none" className="mt-14">
            The product had evolved <span style={{ color: "var(--accent)" }}>faster</span> than the brand.
          </Statement>
        </Reveal>
      </Hero>

        {/* 2 - WHY A REDESIGN */}
        <Section id="why">
          <Reveal>
            <Label>why a redesign</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5 " style={{ fontSize: "var(--text-h3)" }}>
              A story that had fallen out of step.
            </Statement>
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
            <Statement maxW="none" className="mt-5 " style={{ fontSize: "var(--text-h3)" }}>One brand, from landing page to tote bag.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              I realigned the landing page to the AI-concierge story, rebuilt the integrations flow to cut setup friction, and produced the growth system: one-pagers, event emailers, and conference collateral, benchmarked against the field and built with the growth team.
            </Body>
          </Reveal>

          {/* the headline deliverable: the homepage */}
          <Reveal delay={140} variant="scale" className="mt-10">
            <SiteBrowser
              src="/kodif/home-before.jpg"
              alt="Kodif homepage"
            />
          </Reveal>

          {/* the feature block, shipped as one switchable component */}
          <Reveal delay={120} className="mt-14">
            <Body className="!max-w-none">
              The site&rsquo;s capabilities ship as one component, four states. Same pattern, four AI roles, switchable:
            </Body>
          </Reveal>
          <Reveal delay={140} variant="scale" className="mt-5">
            <FeatureTabs />
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-14 flex flex-wrap items-center gap-3">
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

        {/* 4b - REVISED BRAND GUIDELINES (rebuilt natively from the token sheets) */}
        <Section id="guidelines">
          <Reveal>
            <Label>revised brand guidelines</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">The redesign, codified.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5 !max-w-none">
              The pieces a team keeps reaching for: a color palette, the semantic tokens that map color to meaning, and a type scale, so every new page ships on-brand without guesswork.
            </Body>
          </Reveal>

          {/* COLOR — neutrals */}
          <Reveal delay={120} className="mt-12">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">Color · neutrals</p>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-3 grid grid-cols-7 gap-2 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
              {NEUTRALS.map((n) => (
                <div key={n.name}>
                  <div className="h-12 w-full rounded-md border border-border" style={{ backgroundColor: n.hex }} data-cursor-label={n.hex} />
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">{n.name}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* COLOR — brand hues */}
          <Reveal delay={120} className="mt-10">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">Color · brand hues</p>
          </Reveal>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {HUES.map((h, i) => (
              <Reveal key={h.name} delay={(i % 7) * 50}>
                <div>
                  <div className="h-20 w-full rounded-lg border border-border" style={{ backgroundColor: h.hex }} data-cursor-label={h.hex} />
                  <p className="mt-2 font-heading leading-tight text-text" style={{ fontSize: "1.05rem" }}>{h.name}</p>
                  <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">{h.step} · {h.hex}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* SEMANTIC */}
          <Reveal delay={120} className="mt-12">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">Semantic styles</p>
          </Reveal>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SEMANTIC.map((s, i) => (
              <Reveal key={s.role} delay={(i % 5) * 50}>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3" style={{ backgroundColor: "var(--bg)" }}>
                  <span className="h-8 w-8 shrink-0 rounded-md border border-border" style={{ backgroundColor: s.hex }} data-cursor-label={s.hex} />
                  <div className="min-w-0">
                    <p className="font-heading leading-tight text-text" style={{ fontSize: "1rem" }}>{s.role}</p>
                    <p className="truncate font-mono text-caption-2 uppercase tracking-wide text-muted">{s.token}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* RADIUS */}
          <Reveal delay={120} className="mt-10">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">Radius</p>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-3 flex flex-wrap gap-5">
              {RADII.map((r) => (
                <div key={r.name} className="text-center">
                  <div className="h-14 w-14 border-2 border-text/30" style={{ borderRadius: r.px }} />
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">{r.name}</p>
                  <p className="font-mono text-[10px] text-muted/70">{r.px === 999 ? "∞" : `${r.px}px`}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* TYPE */}
          <Reveal delay={120} className="mt-12">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">Type scale</p>
          </Reveal>
          <div className="mt-3 border-t border-border">
            {TYPE_SCALE.map((t, i) => (
              <Reveal key={t.name} delay={(i % 6) * 50}>
                <div className="flex flex-col gap-2 border-b border-border py-5 sm:flex-row sm:items-baseline sm:gap-8">
                  <div className="sm:w-44 sm:shrink-0">
                    <p className="font-mono text-caption-2 uppercase tracking-wide text-text">{t.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{t.spec}</p>
                  </div>
                  <p
                    className="min-w-0 text-text"
                    style={{
                      fontFamily: t.mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "var(--font-body)",
                      fontSize: `${t.size}px`,
                      lineHeight: `${t.lh}px`,
                    }}
                  >
                    {t.sample}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 5 - PRINCIPLES */}
        <Section id="principles">
          <Reveal>
            <Label>principles</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement className="mt-5">Five rules kept it one system.</Statement>
          </Reveal>
          {/* Manifesto rows: one rule per full-width row, hairline divider
              between each. Accent number sits in a fixed column so every title
              lines up; body flows to the right. No empty grid cell, left-aligned
              to the section. */}
          <div className="mt-12 border-t border-border">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={(i % 5) * 60}>
                <div className="flex flex-col gap-2 border-b border-border py-7 sm:flex-row sm:items-baseline sm:gap-8 sm:py-8">
                  <span
                    className="shrink-0 font-display leading-none sm:w-20"
                    style={{
                      color: "var(--accent)",
                      fontSize: "var(--text-h4)",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    0{i + 1}
                  </span>
                  <div className="sm:flex-1">
                    <h3 className="font-heading text-h4 leading-snug text-text">{p.title}</h3>
                    <Body className="mt-2 !max-w-none">{p.body}</Body>
                  </div>
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
            <Statement maxW="none" className="mt-5 " style={{ fontSize: "var(--text-h3)" }}>The narrative caught up, and so did the numbers.</Statement>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <div className="border border-border p-8" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="font-display" style={{ color: "var(--accent)", fontSize: "var(--text-h1)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
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

          {/* Two animated artefacts, side by side: the integrations radial
              (one concierge wired into the tools customers use) and the
              time-to-ROI chart. Both auto-loop, no audio. */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <Reveal delay={120} variant="scale">
              <p className="mb-3 font-mono text-caption-2 uppercase tracking-wide text-muted">
                Connected everywhere
              </p>
              <div
                className="relative w-full overflow-hidden border border-border aspect-square"
                style={{ backgroundColor: "var(--bg)" }}
                data-cursor-label="wired into their stack"
              >
                <video
                  src="/kodif/integrations.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Kodif at the centre, integration logos radiating outward"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <p className="mt-3 font-body text-caption-1 text-muted">
                One concierge, wired into the tools customers already use.
              </p>
            </Reveal>

            <Reveal delay={200} variant="scale">
              <p className="mb-3 font-mono text-caption-2 uppercase tracking-wide text-muted">
                Time to ROI
              </p>
              <div
                className="relative w-full overflow-hidden border border-border aspect-square"
                style={{ backgroundColor: "var(--bg)" }}
                data-cursor-label="eight weeks, week by week"
              >
                <video
                  src="/kodif/time-to-roi.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Time to ROI chart animating across eight weeks: audit, design, integrate, refine"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <p className="mt-3 font-body text-caption-1 text-muted">
                From audit to refine in eight weeks, with tickets resolved and CSAT moving together.
              </p>
            </Reveal>
          </div>

          {/* the lasting deliverable, as a single-line kicker under the clips */}
          <Reveal delay={120}>
            <p className="mt-12 font-heading leading-[1.2] text-text" style={{ fontSize: "var(--text-paragraph-2)", letterSpacing: "-0.01em" }}>
              I left Kodif with more than a homepage: a component library and design tokens the team still builds on.
            </p>
          </Reveal>
      </Section>
    </CaseStudyFrame>
  );
}
