"use client";

import { useEffect, useRef, useState } from "react";
import {
  Body,
  CaseStudyFrame,
  Hero,
  Label,
  Mark,
  MotionFrame,
  Reveal,
  Section,
  Statement,
  CountUp,
} from "@/app/components/case-studies/shared/CaseStudyLayout";

/**
 * Temple case study (9and9) - the page the shared template in
 * shared/CaseStudyLayout was lifted from, and still the reference for it:
 * one centred axis, a left dot rail, lowercase mono labels, full-width art.
 * Kept deliberately simple: background, the problem, why I redesigned it
 * in 2026, the original screens, impact, and two reflections. Accent is a
 * devotional saffron; the voice is measured (no handwritten asides).
 *
 * Images live in /public/temple/; each falls back to a labelled placeholder.
 */

// ---------------------------------------------------------------- project config


// ---------------------------------------------------------------- data

const SECTIONS = [
  { id: "overview", label: "overview" },
  { id: "outcome", label: "impact" },
  { id: "background", label: "background" },
  { id: "problem", label: "the problem" },
  { id: "redesign", label: "2026 redesign" },
  { id: "screens", label: "2021 build" },
] as const;

// Four columns, each value stacked line by line, matching the reference.
const META: { label: string; value: string[] }[] = [
  { label: "Timeline", value: ["2021–2023", "2026 AI redesign"] },
  { label: "Role", value: ["Associate Product Manager", "Designer"] },
  { label: "Team", value: ["3 PMs", "2 UX", "3 Devs", "5 stakeholders"] },
  { label: "Tools", value: ["Claude Code", "Figma", "Illustrator"] },
];

const CHALLENGES = [
  {
    title: "Fraud & revenue loss",
    body: "Manual paper tickets created untraceable leakage. Fakes were easy, and impossible to audit.",
  },
  {
    title: "The thundering herd",
    body: "With no digital slotting, visitors arrived in waves. Overcrowding turned dangerous at peak.",
  },
  {
    title: "No shared language",
    body: "Visitors came from all over India, speaking dozens of languages. Everything on site was in one or two of them, so most people could not read the instructions or ask for help.",
  },
];

// The three AI features added in the 2026 redesign, on top of the original
// brand and booking flow. Images are dropped into /public/temple/ai/.
const REDESIGN_FEATURES = [
  {
    eyebrow: "speed",
    title: "Fast lane for returning visitors",
    body: "Saved details let repeat visitors rebook in seconds.",
    // ?t= is the poster frame: a moment inside this clip's own chapter range
    // (fastlane 16.8-31.1, forecast 31.1-42.9, nandi 42.9-63.4).
    img: "/temple/ai/fastlane.html",
  },
  {
    eyebrow: "crowds",
    title: "Crowd-aware date picker",
    body: "Shows busy and quiet days, so visitors can choose a calmer time.",
    img: "/temple/ai/forecast.html",
  },
  {
    eyebrow: "language",
    title: "Nandi, a voice and chat guide",
    body: "Answers questions in 11 Indian languages. Nandi is named after the sacred bull that guards Shiva temples.",
    img: "/temple/ai/nandi.html",
  },
];

// The four screens of the original (2021–2023) booking flow. Rendered
// upright in PhoneStory, each with a step number, title, and one-line
// description.
const FLOW: PhoneScreen[] = [
  { src: "/temple/screens/book-calendar.png", caption: "01", label: "Choose date & service", body: "A traffic-light heatmap shows real-time slot availability at a glance.", cursor: "available / filling / sold out" },
  { src: "/temple/screens/book-form.png", caption: "02", label: "Enter details", body: "Basic info only, with auto-fill for returning pilgrims.", cursor: "the short form" },
  { src: "/temple/screens/book-confirm.png", caption: "03", label: "Review", body: "Dress code, rules, and visit details, confirmed before paying.", cursor: "read before you pay" },
  { src: "/temple/screens/book-pay.png", caption: "04", label: "Pay & download", body: "UPI, card, or net banking. The QR ticket generates offline.", cursor: "works on 2G" },
];

// The headline numbers, rendered as an editorial list rather than a grid.
// `from` is the "before" value, set in the same display serif and accent as
// the count-up that follows it.
const METRICS = [
  { from: "$18.5M", prefix: "$", value: 25, decimals: 0, suffix: "M", label: "Annual revenue", sub: "INR ₹120 crore to ₹217.2 crore" },
  { from: "3 hrs", prefix: "", value: 45, decimals: 0, suffix: " min", label: "Daily staff admin time", sub: null },
  { from: null, prefix: "", value: 174, decimals: 0, suffix: "+", label: "Historic sites onboarded statewide", sub: null },
];

// The rest of the impact. Each note carries its own Phosphor glyph, stored as
// a single path on a 0 0 256 256 box so it can inherit the accent colour.
const IMPACT_NOTES = [
  {
    text: "85% less ticket fraud",
    path: "M232,104a8,8,0,0,0,8-8V64a16,16,0,0,0-16-16H32A16,16,0,0,0,16,64V96a8,8,0,0,0,8,8,24,24,0,0,1,0,48,8,8,0,0,0-8,8v32a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V160a8,8,0,0,0-8-8,24,24,0,0,1,0-48ZM32,167.2a40,40,0,0,0,0-78.4V64H88V192H32Zm192,0V192H104V64H224V88.8a40,40,0,0,0,0,78.4Z",
  },
  {
    text: "85% staff adoption across 174+ sites",
    path: "M27.2,126.4a8,8,0,0,0,11.2-1.6,52,52,0,0,1,83.2,0,8,8,0,0,0,11.2,1.59,7.73,7.73,0,0,0,1.59-1.59h0a52,52,0,0,1,83.2,0,8,8,0,0,0,12.8-9.61A67.85,67.85,0,0,0,203,93.51a40,40,0,1,0-53.94,0,67.27,67.27,0,0,0-21,14.31,67.27,67.27,0,0,0-21-14.31,40,40,0,1,0-53.94,0A67.88,67.88,0,0,0,25.6,115.2,8,8,0,0,0,27.2,126.4ZM176,40a24,24,0,1,1-24,24A24,24,0,0,1,176,40ZM80,40A24,24,0,1,1,56,64,24,24,0,0,1,80,40ZM203,197.51a40,40,0,1,0-53.94,0,67.27,67.27,0,0,0-21,14.31,67.27,67.27,0,0,0-21-14.31,40,40,0,1,0-53.94,0A67.88,67.88,0,0,0,25.6,219.2a8,8,0,1,0,12.8,9.6,52,52,0,0,1,83.2,0,8,8,0,0,0,11.2,1.59,7.73,7.73,0,0,0,1.59-1.59h0a52,52,0,0,1,83.2,0,8,8,0,0,0,12.8-9.61A67.85,67.85,0,0,0,203,197.51ZM80,144a24,24,0,1,1-24,24A24,24,0,0,1,80,144Zm96,0a24,24,0,1,1-24,24A24,24,0,0,1,176,144Z",
  },
  {
    text: "500K registrations at Srisailam",
    path: "M254.3,107.91,228.78,56.85a16,16,0,0,0-21.47-7.15L182.44,62.13,130.05,48.27a8.14,8.14,0,0,0-4.1,0L73.56,62.13,48.69,49.7a16,16,0,0,0-21.47,7.15L1.7,107.9a16,16,0,0,0,7.15,21.47l27,13.51,55.49,39.63a8.06,8.06,0,0,0,2.71,1.25l64,16a8,8,0,0,0,7.6-2.1l55.07-55.08,26.42-13.21a16,16,0,0,0,7.15-21.46Zm-54.89,33.37L165,113.72a8,8,0,0,0-10.68.61C136.51,132.27,116.66,130,104,122L147.24,80h31.81l27.21,54.41ZM41.53,64,62,74.22,36.43,125.27,16,115.06Zm116,119.13L99.42,168.61l-49.2-35.14,28-56L128,64.28l9.8,2.59-45,43.68-.08.09a16,16,0,0,0,2.72,24.81c20.56,13.13,45.37,11,64.91-5L188,152.66Zm62-57.87-25.52-51L214.47,64,240,115.06Zm-87.75,92.67a8,8,0,0,1-7.75,6.06,8.13,8.13,0,0,1-1.95-.24L80.41,213.33a7.89,7.89,0,0,1-2.71-1.25L51.35,193.26a8,8,0,0,1,9.3-13l25.11,17.94L126,208.24A8,8,0,0,1,131.82,217.94Z",
  },
  {
    text: "Multiple Indian languages supported",
    path: "M247.15,212.42l-56-112a8,8,0,0,0-14.31,0l-21.71,43.43A88,88,0,0,1,108,126.93,103.65,103.65,0,0,0,135.69,64H160a8,8,0,0,0,0-16H104V32a8,8,0,0,0-16,0V48H32a8,8,0,0,0,0,16h87.63A87.76,87.76,0,0,1,96,116.35a87.74,87.74,0,0,1-19-31,8,8,0,1,0-15.08,5.34A103.63,103.63,0,0,0,84,127a87.55,87.55,0,0,1-52,17,8,8,0,0,0,0,16,103.46,103.46,0,0,0,64-22.08,104.18,104.18,0,0,0,51.44,21.31l-26.6,53.19a8,8,0,0,0,14.31,7.16L148.94,192h70.11l13.79,27.58A8,8,0,0,0,240,224a8,8,0,0,0,7.15-11.58ZM156.94,176,184,121.89,211.05,176Z",
  },
  {
    text: "Adopted as the Andhra Pradesh state model",
    path: "M238.25,229A8,8,0,0,1,227,230.25c-.37-.3-38.82-30.25-99-30.25S29.36,230,29,230.26a8,8,0,0,1-10-12.51c1.63-1.3,38.52-30.26,98.29-33.45A119.94,119.94,0,0,1,114,146.37c1.74-21.71,10.92-50.63,43-72.48A64.65,64.65,0,0,0,140.26,72c-19,.62-30.94,11.71-36.5,33.92A8,8,0,0,1,96,112a7.64,7.64,0,0,1-1.94-.24,8,8,0,0,1-5.82-9.7c9.25-36.95,33.11-45.42,51.5-46a81.48,81.48,0,0,1,21.68,2.45c-3.83-6.33-9.43-12.93-17.21-16.25-10-4.24-22.17-2.39-36.31,5.51a8,8,0,0,1-7.8-14c18.74-10.45,35.72-12.54,50.48-6.2,12.49,5.36,20.73,15.78,25.87,25,6.18-9.64,13.88-16.17,22.39-18.94,11.86-3.87,24.64-.72,38,9.37a8,8,0,0,1-9.64,12.76c-8.91-6.73-16.77-9.06-23.35-6.93-7.29,2.35-12.87,10-16.37,16.61A70.46,70.46,0,0,1,208,73.07c14.61,8.35,32,26.05,32,62.94a8,8,0,0,1-16,0c0-23.46-8.07-40-24-49a50.49,50.49,0,0,0-5.75-2.8,55.64,55.64,0,0,1,5.06,33.06,59.41,59.41,0,0,1-8.86,23.41,8,8,0,0,1-13.09-9.2c.74-1.09,16.33-24.38-3.26-49.37-27,15.21-41.89,37.25-44.16,65.59a104.27,104.27,0,0,0,3.83,36.44c62.65,1.81,101.52,32.33,103.2,33.66A8,8,0,0,1,238.25,229ZM24,140a28,28,0,1,1,28,28A28,28,0,0,1,24,140Zm16,0a12,12,0,1,0,12-12A12,12,0,0,0,40,140Z",
  },
];

// ---------------------------------------------------------------- helpers

// The editorial block from the Emma Wu reference: a mono label, a subheading,
// a wide line of grey body copy, then the art running full width beneath it.
function Chapter({
  label,
  title,
  body,
  img,
}: {
  label: string;
  title: string;
  body: string;
  img?: string;
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
      {img ? (
        <div className="mt-8">
          <MotionFrame src={img} title={title} />
        </div>
      ) : null}
    </Reveal>
  );
}

// The AI walkthrough is a scroll scene, not a clip: the phone stays pinned for
// the length of a tall scroll track while the page's scroll position is piped
// into the iframe, one beat per screenful. Sticky can't live inside the iframe
// (a full-height iframe never scrolls), so the pinning happens out here.
const SCENE_STEPS_FALLBACK = 15;
const SCENE_VH_PER_STEP = 50;

function ScrollScene({ src, title }: { src: string; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [steps, setSteps] = useState(SCENE_STEPS_FALLBACK);

  // the scene announces its own step count once it boots
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data && e.data.sceneReady && typeof e.data.steps === "number") setSteps(e.data.steps);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      if (span <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / span));
      frame.current?.contentWindow?.postMessage({ scene: p }, "*");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [steps]);

  return (
    <div className="relative w-screen" style={{ left: "50%", marginLeft: "-50vw" }}>
      <div ref={track} style={{ height: `${steps * SCENE_VH_PER_STEP + 100}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <iframe ref={frame} src={src} title={title} className="h-full w-full" loading="lazy" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- types

type PhoneScreen = {
  src: string;
  caption?: string;   // small eyebrow above label (e.g. step number)
  label?: string;     // bolded title under the phone
  body?: string;      // optional one-line description below the label
  cursor?: string;
};

// ---------------------------------------------------------------- page

export function TempleCaseStudy() {
  return (
    <CaseStudyFrame accent="temple" sections={SECTIONS}>
      <Hero
        eyebrow="9and9"
        title={<>A booking platform for India&rsquo;s historic and sacred sites, built from scratch.</>}
        intro={
          <>
            9and9 builds software for historic and sacred temples in India. I led its ticket booking app from 0 to 1
            as Associate PM and Designer, starting with Srisailam, a centuries-old Shiva temple and historic site in
            South India. Srisailam&rsquo;s revenue grew from $18.5M to $25M.
          </>
        }
        meta={META}
        lead={
          <MotionFrame src="/temple/9and9-2026-motion-revised.html" title="9and9, redesigned in 2026: motion piece" />
        }
        leadCaption="Short on time? This clip is all you need."
      />

        {/* 2 - IMPACT */}
        <Section id="outcome">
          <Reveal>
            <Label>impact</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5" style={{ fontSize: "var(--text-h3)" }}>From a free pilot to the state model.</Statement>
          </Reveal>

          {/* An editorial list, not a grid: one number per row, unruled, with
              the "before" value set in the same serif and accent. Spacing
              alone separates the rows. */}
          <ul className="mt-12">
            {METRICS.map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <li className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                  <p
                    className="font-display"
                    style={{ color: "var(--accent)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}
                  >
                    {m.from ? (
                      <>
                        <span className="text-muted" style={{ fontSize: "var(--text-h3)" }}>{m.from}</span>
                        <span className="mx-2 text-muted" style={{ fontSize: "var(--text-h3)" }}>&rarr;</span>
                      </>
                    ) : null}
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

          <Reveal delay={120}>
            <ul className="mt-12 grid gap-0 sm:grid-cols-2 sm:gap-x-16">
              {IMPACT_NOTES.map((n, i) => (
                <li
                  key={n.text}
                  className={`flex w-full items-center gap-4 py-5 ${
                    i === IMPACT_NOTES.length - 1 ? "sm:col-span-2" : ""
                  }`}
                >
                  <svg
                    aria-hidden
                    width="26"
                    height="26"
                    viewBox="0 0 256 256"
                    className="shrink-0"
                    style={{ fill: "var(--accent)" }}
                  >
                    <path d={n.path} />
                  </svg>
                  <Body className="!max-w-none">{n.text}</Body>
                </li>
              ))}
            </ul>
          </Reveal>
        </Section>

        {/* 3 - BACKGROUND */}
        <Section id="background">
          <Reveal>
            <Label>background</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5" style={{ fontSize: "var(--text-h3)" }}>A huge market, an outdated experience.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Visiting a temple or a historic site in India is a hassle: timed entry, long lines, and big crowds. Religious
              travel is one of India&rsquo;s largest travel segments. The country&rsquo;s faith-based tourism market is
              expected to reach <Mark>$17.2B</Mark> in 2026, and <Mark>$46.8B</Mark> by 2036.
            </Body>
          </Reveal>
          <Reveal delay={160}>
            <Body className="mt-5">
              Srisailam is one of 23,000+ temples under the Andhra Pradesh Endowments Department, and one of the most heavily
              trafficked. Every ticket was bought in person, on the day, after a 3 to 6 hour queue.
            </Body>
          </Reveal>
        </Section>

        {/* 4 - THE PROBLEM */}
        <Section id="problem">
          <Reveal>
            <Label>the problem</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5" style={{ fontSize: "var(--text-h3)" }}>Visitors wanted in. An outdated system kept them out.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Srisailam draws huge crowds, but booking a visit was hard. <Mark>65% of visitors gave up halfway</Mark> through
              booking. Ticket fraud went unchecked, and staff spent 3 hours a day on admin work. In 2020 alone, Srisailam
              earned $18.5M (₹120 crore). The pandemic pushed that number down further, but it had never been strong: money
              leaked out at every step, long before anyone had heard of the virus.
            </Body>
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

        {/* 5 - 2026: REBUILT AI NATIVE */}
        <Section id="redesign">
          <Reveal>
            <Label>2026</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5" style={{ fontSize: "var(--text-h3)" }}>Rebuilt AI native, for its users.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              I designed 9and9 between 2021 and 2023, for visitors on 2G phones who waited 3 to 6 hours in line for a paper
              ticket. Today, AI makes things possible that weren&rsquo;t back then. So I asked: how would I build it now? I
              kept the brand and the booking flow, and added three things.
            </Body>
          </Reveal>

          <div className="mt-20 flex flex-col gap-20">
            {REDESIGN_FEATURES.map((f) => (
              <Chapter key={f.title} label={f.eyebrow} title={f.title} body={f.body} img={f.img} />
            ))}
            <Chapter
              label="principle"
              title="AI that respects the person using it."
              body="AI does the heavy lifting, and the person stays in control. Nothing books, pays, or changes without an explicit confirmation."
            />
          </div>

          {/* the payoff, last: the full redesigned flow, all three features in
              place, unrolling one beat per screenful against a pinned phone */}
          <div className="mt-20">
            <ScrollScene
              src="/temple/9and9-2026-ai-redesign.html"
              title="9and9, redesigned with AI: the full flow"
            />
          </div>
        </Section>

        {/* 6 - WHAT I DID IN 2021 (the original screens) */}
        <Section id="screens">
          <Reveal>
            <Label>before</Label>
          </Reveal>
          <Reveal delay={60}>
            <Statement maxW="none" className="mt-5" style={{ fontSize: "var(--text-h3)" }}>What I did in 2021.</Statement>
          </Reveal>
          <Reveal delay={120}>
            <Body className="mt-5">
              Four steps: date and slot, personal details, review the rules, pay. Built to work on 2G, and for people booking
              online for the first time.
            </Body>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-10">
            {FLOW.map((s, i) => (
              <Reveal key={s.src} delay={i * 70}>
                <figure>
                  <div className="overflow-hidden border border-border" data-cursor-label={s.cursor}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt={s.label ?? ""} className="block w-full" />
                  </div>
                  <figcaption className="mt-4">
                    <p className="font-mono text-caption-2 uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                      {s.caption}
                    </p>
                    <p className="mt-1 font-heading leading-snug text-text" style={{ fontSize: "var(--text-h4)" }}>
                      {s.label}
                    </p>
                    <Body className="mt-1 !max-w-none">{s.body}</Body>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-20">
            <Statement maxW="none" style={{ fontSize: "var(--text-h3)" }}>Wanna see more?</Statement>
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
