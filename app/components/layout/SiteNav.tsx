"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollSmoother } from "@/app/lib/gsap";

// Shared navigation: social links left, centered wordmark, page links right.
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

const NAV: { label: string; href: string; section?: string }[] = [
  { label: "WORK", href: "/#work", section: "#work" },
  { label: "PLAYGROUND", href: "/playground" },
  { label: "ABOUT", href: "/about" },
];

// Same animated underline sweep the footer links use.
const LINK_CLASS =
  "relative opacity-80 transition-opacity duration-150 hover:opacity-100 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100";

export function SiteNav() {
  const pathname = usePathname();
  const onHome = pathname === "/";

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
      {/* Equal side columns keep the wordmark centered independently of link widths. */}
      <nav
        className="relative grid min-h-16 grid-cols-[1fr_auto_1fr] items-center gap-y-1 px-3 py-3 sm:px-8"
        aria-label="Primary"
      >
        <ul className="pointer-events-auto col-start-1 row-start-1 flex items-center gap-0.5 justify-self-start sm:gap-1" aria-label="Social links">
          {SOCIALS.map(({ label, href, path }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                title={label}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="flex h-8 w-5 items-center justify-center rounded opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:h-9 sm:w-8"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true" focusable="false">
                  <path d={path} />
                </svg>
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/"
          onClick={scrollTo(0)}
          aria-label="Home"
          className="pointer-events-auto col-start-2 row-start-1 justify-self-center whitespace-nowrap lowercase tracking-tight opacity-90 transition-opacity duration-150 hover:opacity-70"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(16px, 2vw, 20px)" }}
        >
          shruthi aragonda
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
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
