"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import FootprintsHome from "@/app/components/home/FootprintsHome";
import FooterControls from "@/app/components/home/FooterControls";

/**
 * The one footer for every page — footprint canvas + colour picker + footprint
 * picker + theme toggle + CTA + colophon. Rendered as the last full-screen
 * section on the home and (via SiteFrame) at the bottom of every inner page, so
 * all pages share exactly one footer.
 *
 * An IntersectionObserver flips the global `.hero-active` (nav + cursor go paper)
 * whenever this dark footer fills the viewport. It reads true rendered geometry,
 * so it works under both the home's smoothed scroll and inner pages' native
 * scroll — no ScrollTrigger/ScrollSmoother ordering to get wrong.
 */

type FooterLink = { label: string; href: string; external?: boolean };

const SAY_HI_LINKS: FooterLink[] = [
  { label: "Email", href: "mailto:shruthy@umich.edu", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/shruthi-a-/", external: true },
  { label: "GitHub", href: "https://github.com/Shruthi423", external: true },
  { label: "Substack", href: "https://substack.com/@shruthi29", external: true },
];

const PAGE_LINKS: FooterLink[] = [
  { label: "Work", href: "/#work" },
  { label: "Playground", href: "/playground" },
  { label: "About", href: "/about" },
];

const FOOTER_LINK_CLASS =
  "relative font-mono text-caption-1 uppercase opacity-65 transition-opacity duration-150 hover:opacity-100 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100";

function FooterColumn({ label, links }: { label: string; links: FooterLink[] }) {
  return (
    <div className="flex flex-col items-start">
      <p className="font-mono text-caption-1 font-medium uppercase">{label}</p>
      {/* pointer-events-auto so links stay clickable while the surrounding
          footer stays transparent to the footprint engine underneath */}
      <ul className="pointer-events-auto mt-6 flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className={FOOTER_LINK_CLASS}>
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className={FOOTER_LINK_CLASS}>
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.classList.toggle("hero-active", entry.intersectionRatio >= 0.5);
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("hero-active");
    };
  }, []);

  return (
    <section ref={ref} className="relative h-[85vh]">
      <FootprintsHome
        variant="ambient"
        footprintPicker
        inverted
        controls={<FooterControls />}
      >
        {/* CTA + two link columns + colophon. The wrapper is pointer-events-none
            so footprints spawn in the gaps; the CTA and links opt back in. */}
        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1700px] flex-col justify-between px-5 pb-8 pt-28 sm:px-8 sm:pt-40">
          <div className="grid grid-cols-1 gap-20 md:grid-cols-[1.6fr_1fr] md:gap-24">
            {/* Left — big CTA (colour inherited: paper on the inverted layer) */}
            <div className="flex flex-col items-start" data-quiet>
              <h2
                className="pointer-events-auto font-display text-cta"
                data-cursor-label="I respond fast"
                style={{ fontWeight: 400, fontStyle: "italic", letterSpacing: "-0.02em" }}
              >
                Who doesn&rsquo;t love to leave a footprint!
              </h2>
            </div>

            {/* Right — two link columns */}
            <div className="flex gap-16 sm:gap-24" data-quiet>
              <FooterColumn label="Say hi" links={SAY_HI_LINKS} />
              <FooterColumn label="Page" links={PAGE_LINKS} />
            </div>
          </div>

          {/* Bottom bar, all on one h-9 baseline: copyright (left) · footprint
              + colour + bat cluster (right, from FootprintsHome). */}
          <p
            data-quiet
            className="absolute bottom-8 left-5 flex h-9 items-center whitespace-nowrap font-mono text-caption-1 uppercase opacity-70 sm:left-8"
          >
            Copyright @ shruthi aragonda
          </p>
        </div>
      </FootprintsHome>
    </section>
  );
}
