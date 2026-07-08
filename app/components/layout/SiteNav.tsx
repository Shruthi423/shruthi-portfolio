"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollSmoother } from "@/app/lib/gsap";

/**
 * The one nav bar for every page. Rendered once by SiteFrame so the home and
 * inner pages can never drift. Wordmark (left) + WORK / PLAYGROUND / ABOUT
 * (right). On the home it drives the one-pager's ScrollSmoother (wordmark → top,
 * WORK → the work section); on any other page those become real navigations to
 * `/` and `/#work`. Colour flips to paper over the inverted home footer via the
 * global `.hero-active` class (see globals.css `.site-nav`).
 */
const NAV: { label: string; href: string; section?: string }[] = [
  { label: "WORK", href: "/#work", section: "#work" },
  { label: "PLAYGROUND", href: "/playground" },
  { label: "ABOUT", href: "/about" },
];

// Same animated underline sweep the footer links use.
const LINK_CLASS =
  "relative opacity-80 transition-opacity duration-150 hover:opacity-100 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100";

export function SiteNav() {
  const onHome = usePathname() === "/";

  const scrollTo = (target: number | string) => (e: React.MouseEvent) => {
    // On the home the target lives on this same page — scroll instead of
    // navigating. Elsewhere, fall through to the Link's real navigation.
    if (!onHome) return;
    const smoother = ScrollSmoother.get();
    if (!smoother) return;
    e.preventDefault();
    smoother.scrollTo(target, true);
  };

  return (
    <header className="site-nav pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* scrim keeps the bar legible as content scrolls under it; the tone
          flips with the nav colour over the inverted home footer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            "linear-gradient(to bottom, var(--nav-scrim, var(--bg)), transparent)",
        }}
      />
      {/* Wordmark (left) · links (right). */}
      <nav
        className="relative flex h-16 items-center justify-between px-5 sm:px-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          onClick={scrollTo(0)}
          aria-label="Home"
          className="pointer-events-auto whitespace-nowrap lowercase tracking-tight opacity-90 transition-opacity duration-150 hover:opacity-70"
          style={{ fontFamily: "var(--font-eb-garamond)", fontSize: "clamp(16px, 4.6vw, 22px)" }}
        >
          shruthi aragonda
        </Link>

        <ul className="pointer-events-auto flex items-center gap-4 font-mono text-caption-1 uppercase tracking-wide sm:gap-6">
          {NAV.map(({ label, href, section }) => (
            <li key={label}>
              <Link
                href={href}
                onClick={section ? scrollTo(section) : undefined}
                className={LINK_CLASS}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
