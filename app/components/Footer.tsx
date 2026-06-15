import Link from "next/link";
import { Clouds, NightSky, GrasslandScene } from "./Background";

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
  {
    label: "Substack",
    href: "https://substack.com/@shruthi29",
    external: true,
    cursorLabel: "Words & musings",
  },
];

const PAGE_LINKS: FooterLink[] = [
  { label: "Work", href: "/", cursorLabel: "Okay, the actual work" },
  { label: "Side Quests", href: "/the-lab", cursorLabel: "Off-the-record" },
  { label: "About", href: "/about", cursorLabel: "Who's Shruthi?" },
];

export const FOOTER_HEIGHT = "100vh";

function LinkColumn({ label, links }: { label: string; links: FooterLink[] }) {
  return (
    <div className="flex flex-col items-start">
      <p className="font-mono text-caption-1 font-medium uppercase text-text">
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

export function Footer({ variant = "curtain" }: { variant?: "curtain" | "panel" } = {}) {
  // "curtain" (default): the fixed footer revealed behind scrolling main on
  // inner pages. "panel": a normal full-height block, used as section 3 of the
  // home slider.
  const panel = variant === "panel";
  return (
    <footer
      className={panel ? "relative h-full w-full overflow-hidden" : "fixed inset-x-0 bottom-0 z-0"}
      style={panel ? undefined : { height: FOOTER_HEIGHT }}
    >
      {/* sky-coloured fill + slow-drifting chalk clouds (day) + stars &
          shooting stars (night) + grassland scene as the footer's backdrop.
          The main → footer transition itself is the paper-fog <FogReveal /> at
          the bottom of <main> (see SiteFrame); these clouds are just the
          footer's own gently drifting horizon. */}
      <div className="bg-skyfill" />
      <Clouds />
      <NightSky />
      <GrasslandScene />

      {/* footer content — sits above the backdrop */}
      <div
        className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-between px-6 pb-8 pt-28 sm:px-10 sm:pt-[180px]"
        style={{ zIndex: 2 }}
      >
        <div className="grid grid-cols-1 gap-20 md:grid-cols-[1.6fr_1fr] md:gap-24">
          {/* Left panel: Big text + tagline */}
          <div className="flex flex-col items-start">
            <p className="font-mono text-caption-1 uppercase text-text">
              liked what you saw?
            </p>
            <h2
              className="mt-3 font-display text-cta whitespace-nowrap"
              data-cursor-label="I respond fast"
              style={{
                fontWeight: 700,
                fontStyle: "italic",
                letterSpacing: "-0.02em",
                color: "var(--text)",
              }}
            >
              Might as well{" "}
              <span style={{ color: "var(--color-heading)" }}>say hi.</span>
            </h2>
          </div>

          {/* Right panel: Two link columns */}
          <div className="flex gap-16 sm:gap-24">
            <LinkColumn label="Say hi" links={SAY_HI_LINKS} />
            <LinkColumn label="Page" links={PAGE_LINKS} />
          </div>
        </div>

        {/* Colophon — same EB Garamond italic treatment as the home, anchored
            to the very bottom in the clear foreground below the animals (their
            feet sit 22px+ up); theme-aware ink keeps it legible day and night. */}
        <p
          className="absolute inset-x-0 bottom-2 px-10 text-center text-sm italic text-text opacity-60"
          style={{ fontFamily: "var(--font-eb-garamond)" }}
        >
          Who doesn&rsquo;t love leaving a footprint!
        </p>
      </div>
    </footer>
  );
}
