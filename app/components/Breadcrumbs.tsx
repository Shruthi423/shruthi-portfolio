"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

/**
 * Floating breadcrumb pill — a bottom-center "dock" that gives case-study
 * readers a clear way back up the hierarchy (home › work › this project).
 *
 * It only shows on case-study routes, and only in the middle of the scroll:
 * it fades/slides in once you're past the hero, and tucks away as the
 * curtain-reveal footer (the savanna + CTA) starts to surface, so it never
 * covers the call to action.
 *
 * Kept on neutral theme tokens (not the per-project `--accent`, which is scoped
 * to each case study's own root) since this lives in the global SiteFrame shell.
 */

// Case-study slug → sentence-case label (first letter cap only).
// Presence here is what gates the pill; every one of these sits under /work.
// Keep in sync with app/work/page.tsx.
const CASE_STUDIES: Record<string, string> = {
  "/temple": "Temple",
  "/zuge": "Zuge",
  "/kodif": "Kodif",
  "/onki": "Onki",
  "/theta": "Theta",
  "/handmade-homestead": "Handmade homestead",
  "/indigo-records": "Indigo records",
  "/feeld": "Feeld",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  const current = pathname ? CASE_STUDIES[pathname] : undefined;

  useEffect(() => {
    if (!current) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const remaining =
        document.documentElement.scrollHeight - (window.scrollY + vh);
      const pastHero = window.scrollY > vh * 0.6;
      const beforeFooter = remaining > vh * 0.9; // footer curtain = last ~viewport
      setShow(pastHero && beforeFooter);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [current]);

  if (!current) return null;

  const crumbs = [
    { label: "Shruthi", href: "/", cursor: "Home" },
    { label: "Work", href: "/work", cursor: "All work" },
    { label: current, href: null, cursor: null },
  ];

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ease-out ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 rounded-full border border-border bg-surface/85 px-4 py-2 shadow-lg backdrop-blur-md"
        style={{ fontFamily: "var(--font-eb-garamond)", fontSize: 14 }}
      >
        {crumbs.map((c, i) => (
          <Fragment key={c.label}>
            {i > 0 && (
              <span aria-hidden className="select-none text-text/35">
                &gt;
              </span>
            )}
            {c.href ? (
              <Link
                href={c.href}
                data-cursor-label={c.cursor ?? undefined}
                className="tracking-wide leading-none text-text/55 transition-colors duration-150 hover:text-text"
              >
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="tracking-wide leading-none text-text">
                {c.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
    </div>
  );
}
