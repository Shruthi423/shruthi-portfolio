"use client";
/* eslint-disable @next/next/no-img-element -- case-study screens are optimized PNGs in /public, not gallery photos */

import { useState } from "react";
import {
  Bleed,
  Body,
  CaseStudyFrame,
  CountUp,
  Hero,
  Label,
  Pill,
  Reveal,
  Section,
  Statement,
} from "@/app/components/case-studies/shared/CaseStudyLayout";

/**
 * Onki / AICap case study - now wearing the site's personality.
 *
 * The "case-study kit" (reusable for every future project): a per-project
 * config block (accent color + handwritten notes) drives a set of branded
 * pieces - a paw-print section nav, Rock Salt margin asides, polaroid screen
 * frames, a frosted grain wash, witty cursor labels, and the project's own
 * colour threaded through eyebrows / nav / metrics. Drop a new config + content
 * and the next case study inherits all of it.
 */

// ---------------------------------------------------------------- project config

// Onki's signature colour (from its /work card), split light/dark for contrast.

// Handwritten asides - DRAFTS in Shruthi's voice. Swap for your real ones.
const NOTES = {
  context: "this was me at every grocery store, honestly.",
  design: "every choice had a “why”. these are mine →",
  outcome: "still can't believe this actually shipped.",
};

// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "context", label: "context" },
  { id: "insights", label: "insights" },
  { id: "problem", label: "problem" },
  { id: "design", label: "design" },
  { id: "outcome", label: "outcome" },
] as const;

const OVERVIEW_TAGS = [
  "Conversational AI",
  "Multimodal UX",
  "Retail Design",
  "Voice UX",
  "Interaction Design",
];

const META: { label: string; value: string; href?: string }[] = [
  { label: "Company", value: "Onki AI, NYC" },
  { label: "Role", value: "UI/UX Design Intern" },
  { label: "Duration", value: "Apr – Jun 2024" },
  { label: "Tools", value: "Figma, FigJam" },
  { label: "Live", value: "onki.ai", href: "https://onki.ai/" },
];

const INSIGHTS = [
  {
    title: "Shoppers want confidence, not expertise.",
    body: "Nobody wants to become a wine expert in the aisle. They just want to feel good about their choice.",
  },
  {
    title: "Too many options is the real problem.",
    body: "Choice overload, not lack of information, is what kills purchase confidence at the shelf.",
  },
  {
    title: "Trust is the first conversion.",
    body: "If a shopper doesn't feel comfortable with the AI, they walk away before the recommendation even happens.",
  },
];

const DESIGN = [
  {
    title: "Voice + touch: both, not either",
    body: "Some shoppers carry baskets. Some feel self-conscious talking to a screen in public. We designed every interaction to work through both modalities, rooted in inclusive design and redundant interaction pathways.",
    tag: "Inclusive Design",
  },
  {
    title: "Always 3 recommendations, not more",
    body: "Hick's Law: more options = longer decisions. In an aisle of hundreds, 3 curated choices reduce cognitive load and feel like a sommelier's pick, not another shelf.",
    tag: "Cognitive Load",
  },
  {
    title: "Questions ordered by difficulty",
    body: "Type → price → flavor → pairing. Everyone knows red vs white. Far fewer know their tannin preference. Starting simple builds momentum and mirrors how a good sommelier talks to a customer.",
    tag: "Progressive Disclosure",
  },
  {
    title: "Conversational tone, not transactional",
    body: "AICap proactively greets strangers in public. A robotic tone creates resistance. Warm language lowers the psychological barrier before the recommendation happens.",
    tag: "Emotional Design",
  },
  {
    title: "Save / Text me / Item location",
    body: "A recommendation alone doesn't close the loop. These three features address distinct post-decision drop-off moments: finding the bottle, not ready to buy, or revisiting the choice later.",
    tag: "Micro-interaction Design",
  },
];

const SCREENS = [
  {
    src: "/onki/screen-greeting.png",
    label: "Screen: Welcome / greeting",
    caption: "The kiosk greets every shopper who walks by.",
    cursor: "the hello",
    tilt: -3,
  },
  {
    src: "/onki/screen-preference.png",
    label: "Screen: Preference input",
    caption: "Simple questions, one at a time.",
    cursor: "one question at a time",
    tilt: 2.5,
  },
  {
    src: "/onki/screen-recommendations.png",
    label: "Screen: Recommendation cards",
    caption: "3 curated options, like a sommelier's pick.",
    cursor: "the magic three",
    tilt: -2,
  },
  {
    src: "/onki/screen-detail.png",
    label: "Screen: Wine detail",
    caption: "Tasting notes, pairings, winery origin.",
    cursor: "the nerdy details",
    tilt: 3,
  },
  {
    src: "/onki/screen-location.png",
    label: "Screen: Find this wine",
    caption: "Aisle and shelf, or text it to yourself. The loop closes.",
    cursor: "don't lose them",
    tilt: -2.5,
  },
];

const METRICS = [
  { value: 20, suffix: "%", label: "of wine shoppers interacted with AICap" },
  { value: 30, suffix: "%", label: "more spent by shoppers who engaged" },
  { value: 3, suffix: "", label: "interns drove all design decisions independently" },
];

// ---------------------------------------------------------------- helpers

function ArrowDoodle({ className = "" }: { className?: string }) {
  return (
    <svg width="44" height="34" viewBox="0 0 44 34" fill="none" className={className} aria-hidden>
      <path d="M2 5C16 6 31 12 38 27" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 27L28 25M38 27L35 17" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Inline handwritten margin note (desktop only - keeps mobile clean).
function Aside({
  children,
  rotate = -3,
  className = "",
}: {
  children: React.ReactNode;
  rotate?: number;
  className?: string;
}) {
  return (
    <div className={`hidden items-start gap-2 lg:flex ${className}`}>
      <ArrowDoodle className="mt-1 shrink-0" />
      <p
        className={`font-heading max-w-[210px] text-[0.95rem] leading-snug`}
        style={{ color: "var(--accent)", transform: `rotate(${rotate}deg)` }}
      >
        {children}
      </p>
    </div>
  );
}

function Figure({
  src,
  label,
  aspect = "aspect-[16/9]",
  position = "center",
  cursorLabel,
  className = "",
  fit = "cover",
}: {
  src?: string;
  label: string;
  aspect?: string;
  position?: string;
  cursorLabel?: string;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const [errored, setErrored] = useState(false);
  if (src && !errored) {
    return (
      <div
        className={`relative w-full overflow-hidden ${aspect} ${className}`}
        data-cursor-label={cursorLabel}
      >
        <img
          src={src}
          alt={label}
          className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
          style={{ objectPosition: position }}
          onError={() => setErrored(true)}
        />
      </div>
    );
  }
  return (
    <div
      className={`flex w-full flex-col items-center justify-center border-2 border-dashed bg-surface/50 px-4 ${aspect} ${className}`}
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

// Frosted grain wash - paper texture so the page isn't flat (matches the home).
// ---------------------------------------------------------------- page

export function OnkiCaseStudy() {
  return (
    <CaseStudyFrame accent="onki" sections={SECTIONS}>
      <Hero
        eyebrow="Onki"
        title="Designing an AI sommelier for the wine aisle."
        intro={
          <>
            AICap is a voice + touch retail kiosk that helps shoppers discover wine through conversational AI, built by
            Onki, a NYC startup founded by ex-Amazon innovators.
          </>
        }
        meta={META}
        lead={
          <Bleed>
            <Figure
              src="/onki/hero.png"
              label="AiCap greeting screen"
              aspect="aspect-[16/9]"
              fit="contain"
              cursorLabel="say hi to AiCap"
              className="border border-border bg-surface/40"
            />
          </Bleed>
        }
      >
        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap gap-2">
            {OVERVIEW_TAGS.map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>
        </Reveal>
      </Hero>

        {/* 2 - CONTEXT */}
        <Section id="context">
          <Reveal>
            <Statement className="max-w-3xl">
              Wine aisles have hundreds of choices and zero guidance.
            </Statement>
          </Reveal>
          <div className="flex items-end justify-between gap-6">
            <Reveal delay={100}>
              <Body className="mt-6 max-w-2xl">
                Younger shoppers (low-to-medium wine knowledge) consistently
                freeze at the shelf. Too many options, no personalization, no one
                to ask.
              </Body>
            </Reveal>
            <Aside className="mb-1 shrink-0" rotate={-4}>
              {NOTES.context}
            </Aside>
          </div>
          <Reveal variant="scale" className="mt-12">
            <div className="mx-auto max-w-xl">
              <Figure
                src="/onki/context-sketch.png"
                label="Storyboard: the overwhelmed-shopper journey"
                aspect="aspect-square"
                cursorLabel="the overwhelm"
                className="border border-border"
              />
            </div>
          </Reveal>
        </Section>

        {/* 3 - INSIGHTS */}
        <Section id="insights">
          <Reveal>
            <Label>Key Insights</Label>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {INSIGHTS.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <div
                  className="h-full border border-border p-8"
                  style={{ backgroundColor: "var(--bg)" }}
                >
                  <h3 className="font-heading text-h4 leading-snug text-text">{c.title}</h3>
                  <Body className="mt-3">{c.body}</Body>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 4 - PROBLEM */}
        <Section id="problem">
          <Reveal>
            <Statement className="max-w-3xl">
              Today&rsquo;s retail shelves are passive. AICap makes them talk back.
            </Statement>
          </Reveal>
          <Reveal delay={100}>
            <Body className="mt-6 max-w-2xl">
              Static labels and understaffed stores can&rsquo;t deliver
              personalized guidance at scale. We designed the experience that
              bridges that gap, from first greeting to the right bottle.
            </Body>
          </Reveal>
          <div className="mt-12 grid items-start gap-6 sm:grid-cols-2">
            <Reveal>
              <Figure
                src="/onki/before-sarah.png"
                label="Before: the earlier in-store assistant"
                aspect="aspect-[3/4]"
                fit="contain"
                cursorLabel="before"
                className="border border-border bg-surface/40"
              />
              <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">before</p>
            </Reveal>
            <Reveal delay={80}>
              <Figure
                src="/onki/after-aicap.png"
                label="After: the AiCap redesign"
                aspect="aspect-[3/4]"
                fit="contain"
                cursorLabel="after"
                className="border border-border bg-surface/40"
              />
              <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">after</p>
            </Reveal>
          </div>
        </Section>

        {/* 5 - DESIGN DECISIONS */}
        <Section id="design">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.45fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Label>Design Decisions</Label>
              <Statement className="mt-4">The reasoning behind the work.</Statement>
              <Body className="mt-4">Every interaction had a UX principle behind it.</Body>
              <Aside className="mt-8" rotate={-2}>
                {NOTES.design}
              </Aside>
            </div>
            <div className="flex flex-col gap-6">
              {DESIGN.map((c) => (
                <Reveal key={c.title}>
                  <div className="border border-border bg-surface p-8">
                    <h3 className="font-heading text-h4 leading-snug text-text">{c.title}</h3>
                    <Body className="mt-3">{c.body}</Body>
                    <div className="mt-5">
                      <Pill>{c.tag}</Pill>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Information architecture — the full conversation flow, full-width. */}
          <Reveal variant="scale" className="mt-14">
            <Figure
              src="/onki/ia.png"
              label="Information architecture: the full conversation flow"
              aspect="aspect-[16/9]"
              fit="contain"
              cursorLabel="the whole flow"
              className="border border-border bg-surface/40"
            />
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-3 font-mono text-caption-2 uppercase tracking-wide text-muted">
              information architecture
            </p>
          </Reveal>
        </Section>

        {/* 6 - OUTCOME */}
        <Section id="outcome">
          <Reveal>
            <Statement>Designs shipped. Numbers followed.</Statement>
          </Reveal>
          <Reveal delay={100}>
            <Body className="mt-6 max-w-2xl">
              The designs contributed to AICap&rsquo;s real in-store deployment.
              Early retail data showed strong commercial impact.
            </Body>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <div
                  className="h-full border border-border p-8"
                  style={{ backgroundColor: "var(--bg)" }}
                  data-cursor-label={i === 1 ? "the one I'm proud of" : undefined}
                >
                  <p
                    className="font-display"
                    style={{
                      color: "var(--accent)",
                      fontSize: "var(--text-h1)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    <CountUp value={m.value} suffix={m.suffix} />
                  </p>
                  <Body className="mt-3">{m.label}</Body>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 flex items-start justify-between gap-6">
            <Reveal delay={120}>
              <p className="max-w-2xl font-body text-caption-2 leading-relaxed text-muted">
                Post-deployment metrics from Onki&rsquo;s published retail data.
                Deployment occurred after the internship concluded.
              </p>
            </Reveal>
            <Aside className="shrink-0" rotate={3}>
              {NOTES.outcome}
            </Aside>
          </div>
          {/* What shipped — the journey storyboard, then every screen visible. */}
          <Reveal className="mt-14">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-muted">
              the screens, end to end
            </p>
          </Reveal>
          <Reveal variant="scale" delay={80} className="mt-5">
            <Figure
              src="/onki/storyboard.png"
              label="The shopper journey, greeting to bottle"
              aspect="aspect-[3/2]"
              cursorLabel="the whole journey"
              className="border border-border"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {SCREENS.map((s, i) => (
              <Reveal key={s.src} delay={i * 60}>
                <div>
                  <Figure
                    src={s.src}
                    label={s.label}
                    aspect="aspect-[9/16]"
                    cursorLabel={s.cursor}
                    className="border border-border"
                  />
                  <p className="mt-2 font-mono text-caption-2 uppercase tracking-wide text-muted">
                    {s.label.replace("Screen: ", "")}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
      </Section>
    </CaseStudyFrame>
  );
}
