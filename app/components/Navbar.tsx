"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";
import { MenuOverlay } from "./MenuOverlay";

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
  const [open, setOpen] = useState(false);

  return (
    <>
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
        {/* 3-zone grid: empty left (sun/moon toggle floats here) · Menu · icons */}
        <nav
          className="relative grid h-16 w-full grid-cols-3 items-center px-8"
          aria-label="Primary"
        >
          <div />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              data-cursor-label="Look around"
              className="relative font-mono text-caption-1 font-medium uppercase tracking-wide text-text after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
            >
              Menu
            </button>
          </div>
          <div className="flex justify-end">
            <SocialIcons />
          </div>
        </nav>
      </motion.header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
