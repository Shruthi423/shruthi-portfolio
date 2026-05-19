"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";

const NAV_LINKS = [
  { label: "Work", href: "/", cursorLabel: "The good stuff" },
  { label: "Playground", href: "/playground", cursorLabel: "Off-the-record" },
  { label: "About", href: "/about", cursorLabel: "Who's Shruthi?" },
] as const;

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shruthi-a-/",
    Icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/Shruthi423",
    Icon: GitHubIcon,
  },
  {
    label: "Email",
    href: "mailto:shruthy@umich.edu",
    Icon: MailIcon,
  },
] as const;

function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-3 font-mono text-caption-1 uppercase tracking-wide">
      {NAV_LINKS.map((link, i) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <li key={link.href} className="flex items-center gap-3">
            <Link
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              data-cursor-label={link.cursorLabel}
              className={`relative text-text transition-opacity duration-150 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 ${
                isActive ? "opacity-100" : "opacity-80"
              }`}
            >
              {link.label}
            </Link>
            {i < NAV_LINKS.length - 1 && (
              <span aria-hidden className="text-text/40">
                ·
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SocialIcons() {
  return (
    <ul className="flex items-center gap-5">
      {SOCIAL_LINKS.map(({ label, href, Icon }) => (
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
  );
}

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 w-full"
    >
      {/* subtle scrim — keeps cream nav links legible as content scrolls under */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg to-transparent"
      />
      {/* 3-zone grid: empty left (sun/moon toggle floats here) · centered links · icons right */}
      <nav
        className="relative grid h-16 w-full grid-cols-3 items-center px-8"
        aria-label="Primary"
      >
        <div />
        <div className="flex justify-center">
          <NavLinks />
        </div>
        <div className="flex justify-end">
          <SocialIcons />
        </div>
      </nav>
    </motion.header>
  );
}
