"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ScrollSmoother } from "@/app/lib/gsap";
import { WobbleUnderline } from "@/app/components/shared/WobbleUnderline";

// Shared navigation: social links left, centered wordmark, page links right.
// The socials are icon-only until hovered, when the platform name unfurls
// beside the glyph (see `.social-link` in globals.css). Below sm there is no
// room for four glyphs beside the wordmark, so they collapse behind one @ mark
// that drops them down as a named list.
const SOCIALS = [
  {
    "label": "LinkedIn",
    "href": "https://www.linkedin.com/in/shruthi-a-/",
    "path": "M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"
  },
  {
    "label": "GitHub",
    "href": "https://github.com/Shruthi423",
    "path": "M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"
  },
  {
    "label": "Email",
    "href": "mailto:shruthy@umich.edu",
    "path": "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"
  },
  {
    "label": "Substack",
    "href": "https://substack.com/@shruthi29",
    "path": "M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,16V161.57l-51.77-32.35a8,8,0,0,0-8.48,0L72,161.56V48ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V180.43l56-35,56,35v29.14Z"
  }
];

/** Phosphor at-sign — the mark the phone's socials live behind. */
const AT_PATH =
  "M128,24a104,104,0,0,0,0,208c21.51,0,44.1-6.48,60.43-17.33a8,8,0,0,0-8.86-13.33C166,210.38,146.21,216,128,216a88,88,0,1,1,88-88c0,26.45-10.88,32-20,32s-20-5.55-20-32V88a8,8,0,0,0-16,0v4.26a48,48,0,1,0,5.93,65.1c6,12,16.35,18.64,30.07,18.64,22.54,0,36-17.94,36-48A104.11,104.11,0,0,0,128,24Zm0,136a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z";

const NAV: { label: string; href: string; section?: string }[] = [
  { label: "WORK", href: "/#work", section: "#work" },
  { label: "PLAYGROUND", href: "/playground" },
  { label: "ABOUT", href: "/about" },
];

// Same hand-drawn underline the footer links use; the stroke itself is
// WobbleUnderline, and `wobble-link` is what its hover rule hangs off.
const LINK_CLASS =
  "wobble-link opacity-80 transition-opacity duration-150 hover:opacity-100";

export function SiteNav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // A dropdown over a page that also scrolls: close it on Escape and on any
  // pointer landing outside it, so it can never be left hanging open.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Navigating away should not carry the menu to the next page.
  useEffect(() => setMenuOpen(false), [pathname]);

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
        // Taller below md, where the nav wraps onto two rows and the links sit
        // lower than the single-row bar the 24 was measured against.
        className="pointer-events-none absolute inset-x-0 top-0 h-32 md:h-24"
        style={{
          background:
            "linear-gradient(to bottom, var(--nav-scrim, var(--bg)), transparent)",
        }}
      />
      {/* Equal side columns keep the wordmark centered independently of link widths. */}
      <nav
        className="relative grid min-h-16 grid-cols-[1fr_auto_1fr] items-center gap-y-1 px-3 py-3 sm:px-8"
        aria-label="Primary"
      >
        {/* The phone's collapsed socials. Hidden from sm up, where the real row
            below takes over — two renderings rather than one, because the row
            version's hover-to-unfurl has no meaning on touch: here every name
            is simply spelled out. */}
        <div ref={menuRef} className="pointer-events-auto relative col-start-1 row-start-1 justify-self-start sm:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Social links"
            aria-expanded={menuOpen}
            aria-controls="nav-socials"
            // h-11 is the finger, not the glyph — same tap target the icons in
            // the sm row get.
            className="flex h-11 w-11 items-center justify-center rounded opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            <svg className="h-[22px] w-[22px]" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true" focusable="false">
              <path d={AT_PATH} />
            </svg>
          </button>
          <ul
            id="nav-socials"
            // The panel carries its own colours rather than inheriting the
            // nav's: the nav flips to paper over the inverted footer, and a
            // menu that flipped with it would be paper text on paper.
            className="absolute left-0 top-full z-50 flex min-w-[9.5rem] flex-col gap-0.5 rounded-sm border p-1.5 shadow-xl transition-[opacity,transform] duration-200 ease-out"
            style={{
              background: "var(--bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
              opacity: menuOpen ? 1 : 0,
              transform: `translateY(${menuOpen ? "0" : "-0.4rem"})`,
              visibility: menuOpen ? "visible" : "hidden",
            }}
          >
            {SOCIALS.map(({ label, href, path }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 items-center gap-2.5 rounded px-2 font-mono text-caption-1 uppercase tracking-wide opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  <svg className="h-[18px] w-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true" focusable="false">
                    <path d={path} />
                  </svg>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <ul className="pointer-events-auto col-start-1 row-start-1 hidden items-center justify-self-start sm:flex" aria-label="Social links">
          {SOCIALS.map(({ label, href, path }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="social-link flex h-9 items-center rounded px-1.5 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                <svg className="social-icon h-[22px] w-[22px] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true" focusable="false">
                  <path d={path} />
                </svg>
                {/* The name unfurls out of the icon; aria-label already says it,
                    so this copy is decorative and stays out of the a11y tree. */}
                <span aria-hidden className="social-label wobble-link font-mono text-caption-1 uppercase tracking-wide">
                  {label}
                  <WobbleUnderline label={label} />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/"
          onClick={scrollTo(0)}
          aria-label="Home"
          // The splash's written name flies into this box and lands on it, so
          // it needs to be findable from outside the tree.
          data-wordmark
          // The side padding is the gap to the socials, which share this row.
          // It grows the centre column symmetrically, so the wordmark stays
          // centred.
          className="pointer-events-auto col-start-2 row-start-1 justify-self-center whitespace-nowrap px-2 tracking-tight opacity-90 transition-opacity duration-150 hover:opacity-70"
          // The 13px floor is for the phone, where this shares row one with the
          // @ mark; 1.7vw doesn't reach 14px until ~825px wide.
          style={{ fontFamily: "var(--font-apple)", fontSize: "clamp(13px, 1.7vw, 17px)", color: "var(--wordmark)" }}
        >
          Shruthi Aragonda
        </Link>

        <ul className="pointer-events-auto col-span-3 row-start-2 flex items-center justify-self-center gap-5 font-mono text-caption-1 uppercase tracking-wide md:col-span-1 md:col-start-3 md:row-start-1 md:justify-self-end md:gap-5">
          {NAV.map(({ label, href, section }) => (
            <li key={label}>
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={section ? scrollTo(section) : undefined}
                className={LINK_CLASS}
              >
                {label}
                <WobbleUnderline label={label} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
