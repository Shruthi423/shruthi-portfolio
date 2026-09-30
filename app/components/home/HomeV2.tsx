"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollSmoother } from "@/app/lib/gsap";
// ScrollSmoother locates #smooth-wrapper / #smooth-content by id, so no element
// refs are threaded into create() (which keeps the types null-free).
import HeroStack from "@/app/components/home/HeroStack";
import { WorkGrid } from "@/app/components/work/WorkGrid";
import { SiteFooter } from "@/app/components/layout/SiteFooter";
import { activeProjects } from "@/app/lib/projects";

/**
 * The home (`/`). A single soft-scrolling page so the work is one scroll + one
 * click from landing instead of buried behind a nav. Structure:
 * editorial introduction → selected work → footer, the last carrying the
 * footprints as an ambient backdrop (paying off the "leaving a footprint"
 * colophon). GSAP ScrollSmoother provides the weighted feel. Rendered bare by
 * SiteFrame.
 */

export default function HomeV2() {
  const wrapper = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const smoother = ScrollSmoother.create({
        smooth: 1.2,
        effects: true,
        normalizeScroll: true,
      });

      // Arriving from an inner page's "WORK" nav (/#work) — ScrollSmoother owns
      // a transformed container, so native hash scrolling can't reach the grid.
      // Jump there manually once the smoother is live.
      if (window.location.hash === "#work") {
        smoother.scrollTo("#work", false);
      }

      // Gentle rise-in for each section eyebrow/heading as it enters.
      const reveals = gsap.utils
        .toArray<HTMLElement>("[data-reveal]")
        .map((el) =>
          gsap.from(el, {
            opacity: 0,
            y: 28,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          }),
        );

      return () => {
        reveals.forEach((r) => r.scrollTrigger?.kill());
        smoother.kill();
      };
    },
    { scope: wrapper },
  );

  return (
    <>
      {/* Nav is the shared <SiteNav />, rendered once by SiteFrame for every
          page. On the home its WORK / wordmark drive this ScrollSmoother. */}
      <div id="smooth-wrapper" ref={wrapper}>
        <div id="smooth-content">
          {/* 1 — HERO — editorial introduction over the brush-loop backdrop. */}
          <HeroStack />

          {/* 2 — Selected work keeps the compact, curated grid. */}
          <section id="work">
            <WorkGrid projects={activeProjects} heading="Selected projects" />
          </section>

          {/* 3 — FOOTER — the shared <SiteFooter /> (footprint canvas + pickers
              + toggle + CTA + colophon), identical on every page. */}
          <SiteFooter />
        </div>
      </div>
    </>
  );
}
