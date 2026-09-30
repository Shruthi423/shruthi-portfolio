"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/app/lib/gsap";
import { ProjectCard, type Project } from "@/app/components/work/ProjectCard";

/**
 * The "in the works" drawer that sits directly below the home footer. You scroll
 * to the (shortened) footer, and one more swipe pulls these cards up from the
 * bottom edge — a quiet coda showing what's currently cooking. Home only; lives
 * after <SiteFooter /> inside the smooth-scroll stack.
 *
 * The cards rise + fade as the section enters (GSAP ScrollTrigger). A sliver is
 * already visible under the 85vh footer, so it reads as "there's more below."
 * Reduced-motion → the rise is skipped and the cards are simply present.
 */
export function InTheWorksDrawer({ projects }: { projects: Project[] }) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-drawer-card]");
      const anims = cards.map((el, i) =>
        gsap.from(el, {
          opacity: 0,
          y: 90,
          duration: 1,
          ease: "power3.out",
          delay: i * 0.08,
          scrollTrigger: { trigger: el, start: "top 92%" },
        }),
      );
      return () => anims.forEach((a) => a.scrollTrigger?.kill());
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      className="relative px-[27px] pb-28 pt-20 sm:px-6"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div className="mx-auto max-w-[1700px]">
        <p
          data-reveal
          className="mb-10 font-mono text-caption-1 uppercase tracking-wide text-muted"
        >
          In the works
        </p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2">
          {projects.map((p) => (
            <div key={p.name} data-drawer-card>
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
