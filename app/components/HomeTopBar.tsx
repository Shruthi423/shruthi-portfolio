"use client";

import { GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/shruthi-a-/", Icon: LinkedInIcon },
  { label: "GitHub", href: "https://github.com/Shruthi423", Icon: GitHubIcon },
  { label: "Email", href: "mailto:shruthy@umich.edu", Icon: MailIcon },
] as const;

/**
 * Persistent home top bar — socials left, centered wordmark. Rendered at the
 * slider level (OUTSIDE the transformed panel track) so it stays put across all
 * three sections. The bat toggle (global, from layout) sits top-right.
 */
export default function HomeTopBar({
  onHome,
  inverted = false,
}: {
  onHome?: () => void;
  inverted?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-16 items-center px-5 sm:px-8"
      // Over the inverted hero the page ink IS the background, so flip to the
      // paper colour to stay legible. Eases to match the panel slide.
      style={{
        color: inverted ? "var(--paper)" : "var(--ink)",
        transition: "color 0.6s ease",
      }}
    >
      <button
        type="button"
        onClick={onHome}
        aria-label="Back to home"
        data-cursor-label="Home"
        className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap lowercase tracking-tight"
        style={{ fontFamily: "var(--font-eb-garamond)", fontSize: "clamp(16px, 4.6vw, 22px)" }}
      >
        shruthi aragonda
      </button>
      <ul className="pointer-events-auto flex items-center gap-4 sm:gap-5">
        {SOCIALS.map(({ label, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              aria-label={label}
              data-cursor-label={label}
              className="block opacity-70 transition-opacity hover:opacity-100"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
