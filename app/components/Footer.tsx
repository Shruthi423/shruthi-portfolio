import Link from "next/link";
import { GrasslandScene } from "./Background";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  cursorLabel: string;
};

const SAY_HI_LINKS: FooterLink[] = [
  {
    label: "Email",
    href: "mailto:shruthy@umich.edu",
    external: true,
    cursorLabel: "Hope you're doing well...",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shruthi-a-/",
    external: true,
    cursorLabel: "#OpenToConnect",
  },
  {
    label: "GitHub",
    href: "https://github.com/Shruthi423",
    external: true,
    cursorLabel: "Code lives here",
  },
];

const PAGE_LINKS: FooterLink[] = [
  { label: "Work", href: "/", cursorLabel: "The good stuff" },
  { label: "Playground", href: "/playground", cursorLabel: "Off-the-record" },
  { label: "About", href: "/about", cursorLabel: "Who's Shruthi?" },
];

export const FOOTER_HEIGHT = "100vh";

function LinkColumn({ label, links }: { label: string; links: FooterLink[] }) {
  return (
    <div className="flex flex-col items-start">
      <p className="font-mono text-caption-1 uppercase text-text">
        {label}
      </p>
      <ul className="mt-5 flex flex-col gap-2">
        {links.map((l) => {
          const className =
            "relative font-mono text-caption-1 uppercase text-text/65 transition-colors duration-150 hover:text-text after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100";
          return (
            <li key={l.label}>
              {l.external ? (
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label={l.cursorLabel}
                  className={className}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  href={l.href}
                  data-cursor-label={l.cursorLabel}
                  className={className}
                >
                  {l.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-0"
      style={{ height: FOOTER_HEIGHT }}
    >
      {/* sky-coloured fill + grassland scene as the footer's backdrop */}
      <div className="bg-skyfill" />
      <GrasslandScene />

      {/* footer content — sits above the backdrop */}
      <div
        className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-between"
        style={{ padding: "180px 40px 32px", zIndex: 2 }}
      >
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2 md:gap-24">
          {/* Left panel: Big text + tagline */}
          <div className="flex flex-col items-start">
            <p className="font-mono text-caption-1 uppercase text-text">
              liked what you saw?
            </p>
            <h2
              className="mt-3 font-display text-h2"
              data-cursor-label="I respond fast"
              style={{
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "#2d2a26",
              }}
            >
              Might as well{" "}
              <span style={{ color: "#3a7d3a" }}>say hi.</span>
            </h2>
          </div>

          {/* Right panel: Two link columns */}
          <div className="flex gap-16 sm:gap-24">
            <LinkColumn label="Say hi" links={SAY_HI_LINKS} />
            <LinkColumn label="Page" links={PAGE_LINKS} />
          </div>
        </div>

        <p className="text-center font-mono uppercase text-caption-1 text-[#fdf9f2]/75">
          Perpetually evolving, designed with Love
        </p>
      </div>
    </footer>
  );
}
