"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollSmoother } from "@/app/lib/gsap";
// ScrollSmoother locates #smooth-wrapper / #smooth-content by id, so no element
// refs are threaded into create() (which keeps the types null-free).
import HeroStack from "@/app/components/home/HeroStack";
import { WorkGrid } from "@/app/components/work/WorkGrid";
import { SiteFooter, FooterCurtainGap } from "@/app/components/layout/SiteFooter";
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
      // The splash plays on every load, so the page it lifts onto has to be the
      // top of the page. Browsers restore the previous scroll offset on refresh,
      // which would otherwise drop you into the work grid behind the count.
      // The restore itself is disabled by the inline script in app/layout.tsx —
      // it has to run during parse, before the browser schedules the restore,
      // so doing it here would be too late. This just zeroes whatever offset
      // the document happens to be at before the smoother reads it.
      window.scrollTo(0, 0);

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
      } else {
        // Once the smoother is live it owns the scroll position, and a plain
        // window.scrollTo no longer moves it. Park it at the top through the
        // smoother itself, immediately and again after layout settles (images
        // and fonts resize the page under us, and normalizeScroll re-reads the
        // offset on the next frame).
        smoother.scrollTop(0);
        requestAnimationFrame(() => smoother.scrollTop(0));
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
      <div id="smooth-wrapper" ref={wrapper} className="z-10">
        <div id="smooth-content">
          {/* The curtain: everything the page actually shows, opaque so the
              footer pinned behind it stays hidden until the gap below. */}
          <div className="pointer-events-auto relative z-10 bg-bg">
            {/* 1 — HERO — editorial introduction over the brush-loop backdrop. */}
            <HeroStack />

            {/* 2 — Selected work keeps the compact, curated grid. */}
            <section id="work">
              <WorkGrid projects={activeProjects} heading="Selected projects" />
            </section>
          </div>

          {/* 3 — the gap that slides the curtain off the footer. */}
          <FooterCurtainGap />
        </div>
      </div>

      {/* FOOTER — the shared <SiteFooter /> (footprint canvas + pickers +
          colophon), identical on every page. Outside #smooth-wrapper on
          purpose: it's `fixed`, and ScrollSmoother transforms #smooth-content,
          which would otherwise become its containing block. */}
      <SiteFooter />
    </>
  );
}
