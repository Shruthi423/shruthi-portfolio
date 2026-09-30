"use client";

import {
  Bleed,
  Body,
  CaseStudyFrame,
  Hero,
  Pill,
  Reveal,
  Section,
  Statement,
} from "@/app/components/case-studies/shared/CaseStudyLayout";

/**
 * Domu — a short case study, not a long one.
 *
 * The argument is made, frame by frame, in the one-minute explainer
 * (public/domu/explainer.html), so this page doesn't retell it. It opens the
 * same way every other study here opens — the piece first, as the Hero's lead,
 * then the eyebrow, the intro and the meta grid — and stops there. Anything the
 * explainer already says (its own headline, the scope list, the split between
 * intended handoffs and real mistakes, the three columns of the division of
 * labour, the closing line) deliberately does not appear again below it. A page
 * that repeats its own film is just a longer film.
 *
 * The prototype lives in the meta grid, where every other study puts its live
 * link, rather than in a section of its own.
 */

const SECTIONS = [{ id: "overview", label: "overview" }] as const;

const META = [
  { label: "Product", value: "Domu" },
  { label: "Role", value: "Product Design" },
  { label: "Year", value: "2026" }, // confirm
  { label: "Prototype", value: "domu-hannah.vercel.app", href: "https://domu-hannah.vercel.app/" },
] as const;

const OVERVIEW_TAGS = [
  "AI Voice Agents",
  "Ops Dashboard",
  "Division of Labour",
  "Call Review",
  "Prototype",
];

/**
 * The explainer is authored as a 16:9 stage with its own chapter controls
 * beneath it, so MotionFrame's plain 16/9 box would crop the controls off.
 * Reserve the stage's ratio as padding plus a fixed band for the controls
 * instead — exact at every width, where a single aspect-ratio can only be right
 * at one.
 */
function ExplainerFrame() {
  return (
    <Bleed>
      <div className="relative w-full" style={{ paddingBottom: "calc(56.25% + 104px)" }}>
        <iframe
          src="/domu/explainer.html"
          title="Domu in one minute: how Hannah's platform works"
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </Bleed>
  );
}

export function DomuCaseStudy() {
  return (
    <CaseStudyFrame accent="domu" sections={SECTIONS}>
      <Hero
        eyebrow="Domu"
        intro={
          <>
            Hannah is Domu&rsquo;s AI voice agent. She answers the phone for First Financial Credit
            Union, a Domu customer, the way a front-desk rep would. I designed the view her ops lead
            reads afterwards.
          </>
        }
        meta={META}
        lead={<ExplainerFrame />}
        leadCaption="Eight chapters, about a minute. Jump to any of them."
      >
        <Reveal delay={240}>
          <div className="mt-10 flex flex-wrap gap-2">
            {OVERVIEW_TAGS.map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>
        </Reveal>
      </Hero>

      <Section>
        <Reveal>
          <Statement maxW="none">Wanna see more?</Statement>
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
