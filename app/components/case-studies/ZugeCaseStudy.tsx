"use client";

import { useState } from "react";
import {
  Bleed,
  Body,
  CaseStudyFrame,
  CountUp,
  Hero,
  Label,
  Mark,
  MotionFrame,
  Reveal,
  Section,
  Statement,
} from "@/app/components/case-studies/shared/CaseStudyLayout";

/**
 * Zuge case study - built on the same editorial template as 9and9
 * (TempleCaseStudy): one centred axis at FRAME_MAX_WIDTH shared by every text
 * column and every image, a dot rail on the left, Homemade Apple eyebrows, and
 * an impact list ruled with hairlines. The only deliberate difference is the
 * accent: 9and9 is orange, Zuge is the palette's forest green, scoped to this
 * page by overriding --accent on the root wrapper.
 *
 * Images live in /public/zuge/; each falls back to a labelled placeholder.
 */

// The page's accent lives in PROJECT_ACCENTS (app/lib/footprints.ts) with every
// other project's, and is scoped onto the wrapper below, so every var(--accent)
// here (rail, eyebrows, numbers, marks) turns green.


// ---------------------------------------------------------------- data

// Rail order = reading order: the impact lands second, right after the
// overview, the way it does on 9and9.
const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "outcome", label: "the outcome" },
  { id: "problem", label: "the problem" },
  { id: "redesign", label: "2026" },
  { id: "dashboard", label: "before screens" },
  { id: "context", label: "in context" },
] as const;

// Four columns, each value stacked line by line, matching the 9and9 meta block.
const META: { label: string; value: string[]; href?: string }[] = [
  { label: "Team", value: ["1 Product Lead", "2 Senior UX", "3 stakeholders", "me"] },
  { label: "Duration", value: ["2023 – 2024", "redesign in 2026"] },
  { label: "Platform", value: ["7-inch TFT touchscreen"] },
  { label: "Live", value: ["zugeelectric.com"], href: "https://zugeelectric.com/we-are/" },
];

// The 2026 rebuild: what AI made possible that wasn't possible in 2023. Each
// carries its own motion clip, rendered in an iframe the same way the hero's
// lead piece is.
const REDESIGN_FEATURES = [
  {
    eyebrow: "Safety",
    title: "Speed-first screen",
    body: "Less on screen when moving, more when parked. Touch turns off while riding.",
    clip: "/zuge/zuge-clip-speed-first.html",
  },
  {
    eyebrow: "Voice",
    title: "Mitra, a voice guide",
    body: "Drivers talk to it in English or 8 Indian languages, hands on the handlebars.",
    clip: "/zuge/zuge-clip-mitra.html",
  },
  {
    eyebrow: "Orders",
    title: "Spill-aware orders",
    body: "It flags liquid orders at accept, gives a tip at pickup, and alerts the driver before speed breakers.",
    clip: "/zuge/zuge-clip-spill-aware.html",
  },
  {
    eyebrow: "Modes",
    title: "Riding modes",
    body: "Drive, Power, and Eco, each with its own colour. The driver reads the state before reading a single number.",
    clip: "/zuge/zuge-clip-modes.html",
  },
  {
    eyebrow: "Light",
    title: "Day and night",
    body: "A bright map that holds up in direct sun, fully dark after sunset so nothing glares. The light sensor switches it, not the driver.",
    clip: "/zuge/zuge-clip-day-night.html",
  },
  {
    eyebrow: "Battery",
    title: "Low battery, handled early",
    body: "Mitra counts the battery in orders left, not percent: two. It finds a fast charger already on the route, and says when 80% is enough to finish the shift.",
    clip: "/zuge/zuge-clip-low-battery.html",
  },
  {
    eyebrow: "Weather",
    title: "Weather warnings",
    body: "A brief before the shift, a raincoat stop on the way, a reroute around flooding, and the customer told before they ask.",
    clip: "/zuge/zuge-clip-weather.html",
  },
];

const FINDINGS = [
  "Checked their phone 5+ times per delivery.",
  "Had a near-miss from a glance down at speed.",
  "Felt range anxiety in the middle of a shift.",
  "Wanted a built-in display over a taped-on phone.",
];

// Three states, not six. The lock screen, the settings list and the
// accessibility modes were cut: each cost a full-bleed frame and none of them
// carried the argument that navigation owns the screen.
const SCREENS = [
  { file: "zuge/screen-drive.jpg", label: "On the road: speed, nav & music", cursor: "one glance" },
  { file: "zuge/screen-ride.jpg", label: "Ride mode", cursor: "just ride" },
  { file: "zuge/screen-parked.jpg", label: "Parked", cursor: "take off your stand" },
];

// The overlays the driver actually touches mid-shift, shown as standalone
// components rather than full screens. Each sits centred in a uniform tile so
// the landscape and portrait pieces read as one consistent set.
const COMPONENTS = [
  { file: "zuge/meter.png", label: "Battery & range", cursor: "96% · 145 km" },
  { file: "zuge/orders.png", label: "Incoming order", cursor: "₹350 · accept" },
  { file: "zuge/location.png", label: "Driver location", cursor: "500 m away" },
];

// The shipped UI rendered on the real chassis. Two frames, one riding and one
// parked: four was the same product in four paint jobs.
const PROTOTYPES = [
  { file: "zuge/prototype-1.png", label: "Turn-by-turn at 48 km/h", cursor: "650 m to turn" },
  { file: "zuge/prototype-2.png", label: "Parked · CO₂ avoided", cursor: "2.2 g saved" },
];

// The headline numbers, rendered as an editorial list rather than a grid.
const METRICS = [
  { prefix: "", value: 73, decimals: 0, suffix: "%", label: "Less phone use on the road", sub: null },
  { prefix: "", value: 20, decimals: 0, suffix: "%", label: "Faster task completion", sub: null },
  { prefix: "", value: 2, decimals: 0, suffix: "M+", label: "Gig drivers on the platform", sub: null },
];


// ---------------------------------------------------------------- helpers

function Figure({
  src,
  alt,
  label,
  file,
  aspect = "aspect-video",
  position = "center",
  cursorLabel,
  className = "",
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
  fit?: "cover" | "contain";
}) {
  const [errored, setErrored] = useState(false);
  const showImage = !!src && !errored;

  if (showImage) {
    return (
      <div className={`relative w-full overflow-hidden ${aspect} ${className}`} data-cursor-label={cursorLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
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

// The editorial block from 9and9: a Homemade Apple eyebrow, a subheading, a line of grey
// body copy, then the art running full width beneath it.
function Chapter({
  label,
  title,
  body,
  clip,
}: {
  label: string;
  title: string;
  body: string;
  clip?: string;
}) {
  return (
    <Reveal>
      <Label>{label}</Label>
      <h3
        className="mt-4 font-heading leading-snug text-text"
        style={{ fontSize: "var(--text-h3)", letterSpacing: "-0.01em" }}
      >
        {title}
      </h3>
      <p className="mt-3 font-body leading-relaxed text-muted" style={{ fontSize: "var(--text-paragraph)" }}>
        {body}
      </p>
      {clip ? (
        <div className="mt-8">
          <MotionFrame src={clip} title={title} />
        </div>
      ) : null}
    </Reveal>
  );
}

// A mono caption above a run of art, used to name each set of stills.
function SetLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">{children}</p>;
}

// ---------------------------------------------------------------- page

export function ZugeCaseStudy() {
  return (
    <CaseStudyFrame accent="zuge" sections={SECTIONS}>
      <Hero
        eyebrow="Zuge Electric"
        title="Two seconds, eyes down."
        intro={
          <>
            Zuge makes electric scooters for delivery drivers in Bengaluru, India. Drivers run 30+ orders a day. I designed
            the dashboard as a design consultant at Sharp.
          </>
        }
        meta={META}
        lead={
          <MotionFrame
            src="/zuge/zuge-2026-motion.html"
            title="Zuge dashboard, redesigned in 2026: motion piece"
          />
        }
        leadCaption="Short on time? This clip is all you need."
      >
        <Reveal delay={200}>
          <div className="mt-16 pt-10">
            <Label>Principle</Label>
            <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end">
              <p
                className="font-display leading-[1.05] text-text"
                style={{ fontSize: "var(--text-h2)", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                AI suggests.
                <br />
                <span style={{ color: "var(--accent)" }}>The driver decides.</span>
              </p>
              <p
                className="font-body leading-relaxed text-muted lg:pb-2"
                style={{ fontSize: "var(--text-paragraph)" }}
              >
                Nothing is accepted, rerouted, or batched without the driver&rsquo;s confirmation.
              </p>
            </div>
          </div>
        </Reveal>
      </Hero>

        {/* 2 - THE OUTCOME */}
        <Section id="outcome">
          <Reveal>
            <Label>The Outcome</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">Less looking down, more driving.</Statement>
          </Reveal>

          {/* An editorial list, not a grid: one number per row, hairline-ruled. */}
          <ul className="mt-12">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <li
                  className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
                >
                  <p
                    className="font-display"
                    style={{ color: "var(--accent)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}
                  >
                    <span style={{ fontSize: "var(--text-h1)" }}>
                      <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />
                    </span>
                  </p>
                  <div className="sm:max-w-[34ch] sm:text-right">
                    <Body>{m.label}</Body>
                    {m.sub ? (
                      <p className="mt-1 font-body text-muted" style={{ fontSize: "var(--text-paragraph)" }}>
                        {m.sub}
                      </p>
                    ) : null}
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

        </Section>

        {/* 3 - THE PROBLEM */}
        <Section id="problem">
          <Reveal>
            <Label>The Problem</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">
              Every driver was doing this job with a phone taped to the handlebar.
            </Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Across 20+ ride-alongs, the same patterns kept surfacing. None of them were about taste. All of them were
              about safety.
            </Body>
          </Reveal>
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {FINDINGS.map((f, i) => (
              <Reveal key={f} delay={i * 70} className="h-full">
                <div className="flex h-full flex-col gap-5 p-8" style={{ backgroundColor: "var(--bg)" }}>
                  <span
                    className="font-display"
                    style={{ color: "var(--accent)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="font-heading text-h4 leading-snug text-text">{f}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 4 - 2026: AI NATIVE */}
        <Section id="redesign">
          <Reveal>
            <Label>2026</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">Built AI native, so the dashboard thinks before the driver has to.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              I designed Zuge in 2023, before AI could run on a dashboard. So{" "}
              <Mark>I asked: how would I build it now?</Mark> I kept the color-coded riding modes and added three
              things.
            </Body>
          </Reveal>

          <div className="mt-20 flex flex-col gap-20">
            {REDESIGN_FEATURES.map((f) => (
              <Chapter key={f.title} label={f.eyebrow} title={f.title} body={f.body} clip={f.clip} />
            ))}
          </div>
        </Section>

        {/* 7 - THE DASHBOARD */}
        <Section id="dashboard">
          <Reveal>
            <Label>Before Screens</Label>
          </Reveal>
          <Reveal delay={80} className="mt-8">
            <SetLabel>the overlays, as components</SetLabel>
          </Reveal>
          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {COMPONENTS.map((c, i) => (
              <Reveal key={c.file} delay={i * 70}>
                <figure>
                  <Figure
                    src={`/${c.file}`}
                    file={c.file}
                    label={c.label}
                    aspect="aspect-[4/3]"
                    cursorLabel={c.cursor}
                    fit="contain"
                    className="border border-border bg-surface/40"
                  />
                  <figcaption className="mt-4">
                    <p className="font-heading leading-snug text-text" style={{ fontSize: "var(--text-h4)" }}>
                      {c.label}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal delay={80} className="mt-20">
            <SetLabel>the dashboard, across states</SetLabel>
          </Reveal>
          <div className="mt-6 flex flex-col gap-16">
            {SCREENS.map((s, i) => (
              <Reveal key={s.file} delay={i * 40}>
                <figure>
                  <Bleed>
                    <Figure
                      src={`/${s.file}`}
                      file={s.file}
                      label={s.label}
                      aspect="aspect-video"
                      cursorLabel={s.cursor}
                    />
                  </Bleed>
                  <figcaption className="mt-4">
                    <p className="font-heading leading-snug text-text" style={{ fontSize: "var(--text-h4)" }}>
                      {s.label}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 8 - IN CONTEXT */}
        <Section id="context">
          <Reveal>
            <Label>In Context</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5">Final screens, on the bike.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Rendered on the real chassis, across the colourways drivers actually buy. The hierarchy that held up at a desk
              had to hold up here too: at a glance, in sun, mid-shift.
            </Body>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-10">
            {PROTOTYPES.map((p, i) => (
              <Reveal key={p.file} delay={i * 60}>
                <figure>
                  <Figure
                    src={`/${p.file}`}
                    file={p.file}
                    label={p.label}
                    aspect="aspect-[5/4]"
                    cursorLabel={p.cursor}
                    fit="contain"
                    className="border border-border bg-surface/40"
                  />
                  <figcaption className="mt-4">
                    <p className="font-heading leading-snug text-text" style={{ fontSize: "var(--text-h4)" }}>
                      {p.label}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-20">
            <Statement maxW="none" hand>wanna see more?</Statement>
          </Reveal>
          <Reveal delay={60}>
            <Body className="mt-4">
              I&rsquo;m happy to chat more about my process over a call. Reach out to me at{" "}
              <a
                href="mailto:shrutybrahmananda@gmail.com"
                data-cursor-label="say hello"
                className="underline decoration-1 underline-offset-4 transition-colors hover:text-[var(--accent)]"
              >
                shrutybrahmananda@gmail.com
              </a>
            </Body>
          </Reveal>
      </Section>
    </CaseStudyFrame>
  );
}
