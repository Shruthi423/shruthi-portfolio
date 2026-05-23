"use client";

import Link from "next/link";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shruthi-a-/",
    Icon: LinkedInIcon,
  },
  { label: "GitHub", href: "https://github.com/Shruthi423", Icon: GitHubIcon },
  { label: "Email", href: "mailto:shruthy@umich.edu", Icon: MailIcon },
] as const;

/**
 * Inner-page top bar. The wordmark is the way back to the footprints home;
 * socials on the right mirror the home chrome for consistency.
 */
export function InnerTopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      {/* scrim keeps the bar legible as content scrolls under it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg to-transparent"
      />
      <nav
        className="relative flex h-16 items-center justify-start px-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          data-cursor-label="Back to menu"
          className="absolute left-1/2 -translate-x-1/2 text-lg lowercase tracking-tight text-text transition-opacity duration-150 hover:opacity-70"
          style={{ fontFamily: "var(--font-eb-garamond)" }}
        >
          shruthi aragonda
        </Link>
        <ul className="flex items-center gap-5">
          {SOCIALS.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                aria-label={label}
                className="block text-text/70 transition-opacity duration-150 hover:text-text"
              >
                <Icon className="h-5 w-5" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
