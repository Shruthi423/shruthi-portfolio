"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollSmoother } from "@/app/lib/gsap";
// ScrollSmoother locates #smooth-wrapper / #smooth-content by id, so no element
// refs are threaded into create() (which keeps the types null-free).
import { WorkGrid } from "@/app/components/work/WorkGrid";
import FootprintsHome from "@/app/components/home/FootprintsHome";
import { SiteFooter } from "@/app/components/layout/SiteFooter";
import { projects } from "@/app/lib/projects";

/**
 * The home (`/`). A single soft-scrolling page so the work is one scroll + one
 * click from landing instead of buried behind a nav. Structure:
 * frosted-footprints hero → selected work → footer, the last carrying the
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
          {/* 1 — HERO — paper panel (same colour as work), now carrying the
              frosted-footprint cursor track as an ambient backdrop (matching the
              footer). The statement is a quiet zone so prints/wipes fade around
              it and it stays readable. Held to 85vh (not full-screen) so the
              Work section's "Selected projects" heading + filter chips peek
              above the fold, signalling the work is right there. */}
          <section
            className="relative h-[85vh]"
            style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
          >
            <FootprintsHome variant="ambient">
              {/* pointer-events-none so prints spawn in the gaps; the statement
                  is non-interactive and simply reads through the frost. */}
              <div className="pointer-events-none flex h-full flex-col items-center justify-center px-6 text-center">
                <p
                  data-quiet
                  className="max-w-[22ch] text-balance lowercase"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontStyle: "italic",
                    fontSize: "clamp(1.75rem, 4.6vw, 3.5rem)",
                    lineHeight: 1.12,
                    letterSpacing: "-0.02em",
                  }}
                >
                  A multidisciplinary designer who loves storytelling, craft, and
                  making products easy to use.
                </p>
              </div>
            </FootprintsHome>
          </section>

          {/* 2 — SELECTED PROJECTS — WorkGrid owns its own spacing so the list
              view's accent flood can run edge-to-edge. */}
          <section id="work">
            <WorkGrid projects={projects} heading="Selected projects" />
          </section>

          {/* 3 — FOOTER — the shared <SiteFooter /> (footprint canvas + pickers
              + toggle + CTA + colophon), identical on every page. */}
          <SiteFooter />
        </div>
      </div>
    </>
  );
}
