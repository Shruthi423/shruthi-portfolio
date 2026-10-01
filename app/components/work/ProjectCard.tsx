"use client";

import Link from "next/link";
import { useRef, type ComponentType } from "react";
import { gsap, useGSAP } from "@/app/lib/gsap";
import { useThumbnailMotion } from "@/app/components/work/useThumbnailMotion";
import { KolamThumbnail } from "@/app/components/work/KolamThumbnail";
import { AmuseBoucheThumbnail } from "@/app/components/work/AmuseBoucheThumbnail";
import { ZugeThumbnail } from "@/app/components/work/ZugeThumbnail";
import { OpenTabsThumbnail } from "@/app/components/work/OpenTabsThumbnail";
import { DeepCleanThumbnail } from "@/app/components/work/DeepCleanThumbnail";
import { DomuThumbnail } from "@/app/components/work/DomuThumbnail";

// Projects whose card art is a live component rather than a still cover. Each
// one animates only while `active` (hover, or on screen on touch) and rests on
// a still frame otherwise — see useThumbnailMotion.
const LIVE_THUMBNAILS: Record<string, ComponentType<{ active: boolean }>> = {
  "9and9": KolamThumbnail,
  "Amuse Bouche": AmuseBoucheThumbnail,
  DeepClean: DeepCleanThumbnail,
  Domu: DomuThumbnail,
  OpenTabs: OpenTabsThumbnail,
  "Zuge Electric": ZugeThumbnail,
};

// Octicon mark-github. Sits in the label slot (where other cards carry their
// discipline chip) so the card says where its link lands before you click it.
function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-[15px] w-[15px]">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export type Project = {
  name: string;
  archived?: boolean; // Hide from selected work while retaining all project content.
  title?: string; // Concise public title: project name + what it is.
  // The big line in the list view — a first-person "How I ..." framing of the
  // problem. Falls back to `name` when absent (projects without real copy yet).
  headline?: string;
  // Primary category, or a few when the work spanned more than one. Omitted on
  // in-progress tiles that are title-only until there's real copy.
  discipline?: string | string[];
  type?: string; // Full-time / Internship / etc.
  year?: string;
  status: "built" | "building" | "soon"; // drives the /work filter chips (shipped / cooking / on the way)
  description?: string; // one-line summary
  tags?: string[]; // Project topics and outcomes
  image?: string; // floating mockup — wired in later
  imageFit?: "cover" | "contain"; // default "cover"; use "contain" for portrait mockups where the subject must show in full
  hoverLabel?: string; // override the cursor pill on hover (default: "VIEW" when live, "Coming soon" otherwise)
  // The GitHub repo. Always sits in the label slot beside the title, next to
  // the discipline chip, so every card carrying one looks the same. It's the
  // only thing on the card that lands on GitHub.
  repoHref?: string;
  // The live build, for projects that have one but no case study of their own.
  // The title and its arrow land here; `repoHref` is the fallback for projects
  // whose only public face *is* the repo (a CLI tool, say).
  liveHref?: string;
  href?: string;
};


export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const thumbnailActive = useThumbnailMotion(panelRef);
  useGSAP(
    () => {
      // Card rises + fades in as it enters the viewport.
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 48,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 88%" },
      });

      // Floating mockup drifts slower than the card — gentle parallax.
      // (Image-fill cards have no mockup, so only run when present.)
      if (mockupRef.current) {
        gsap.fromTo(
          mockupRef.current,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    },
    { scope: cardRef },
  );

  const LiveThumbnail = LIVE_THUMBNAILS[project.name];

  const visual = (
    // Consistent 4:3 image frames keep every project row aligned.
    <div
      ref={panelRef}
      data-cursor-label={project.hoverLabel ?? (project.href ? "VIEW" : "Coming soon")}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-[10px]"
      style={{ backgroundColor: "var(--surface)" }}
    >
      {LiveThumbnail ? (
        <div className="absolute inset-0">
          <LiveThumbnail active={thumbnailActive} />
        </div>
      ) : project.image ? (
        // Cover-fill by default (landscape hero photos), or contain for portrait
        // mockups that must show in full (they float on the monochrome surface).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image}
          alt={`${project.name} preview`}
          className={`absolute inset-0 h-full w-full ${
            project.imageFit === "contain" ? "object-contain" : "object-cover"
          }`}
        />
      ) : (
        <div
          ref={mockupRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="w-[78%] transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.015]">
            {/* Placeholder "screen" — swapped for a real screenshot later. */}
            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-white/95 shadow-xl ring-1 ring-black/5">
              <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2.5">
                <span className="h-2 w-2 rounded-full bg-black/10" />
                <span className="h-2 w-2 rounded-full bg-black/10" />
                <span className="h-2 w-2 rounded-full bg-black/10" />
              </div>
              <div className="space-y-2 p-4">
                <div className="h-2 w-1/2 rounded bg-black/10" />
                <div className="h-2 w-3/4 rounded bg-black/5" />
                <div className="h-2 w-2/3 rounded bg-black/5" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // The title text — a link of its own on cards whose meta block can't be
  // wrapped in one (see below).
  const titleText = project.title ?? project.name;

  // Where the title (and the arrow beside it) land. A case study wins; failing
  // that the live build; failing that the repo, for projects that are only a
  // repo. The GitHub mark is always its own link to `repoHref` regardless.
  const outboundHref = project.liveHref ?? project.repoHref;
  const titleHref = project.href ?? outboundHref;
  const titleIsExternal = !project.href && Boolean(outboundHref);

  const meta = (linkTitle: boolean) => (
    <div className="mt-3.5 px-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1.5">
        <h3 className="flex min-w-0 items-baseline gap-1.5 font-heading text-[19px] font-medium leading-6 text-text">
          {linkTitle && titleHref ? (
            titleIsExternal ? (
              <a
                href={titleHref}
                target="_blank"
                rel="noreferrer"
                data-cursor-label={project.hoverLabel ?? "VIEW"}
                className="min-w-0"
              >
                {titleText}
              </a>
            ) : (
              <Link href={titleHref} className="min-w-0">
                {titleText}
              </Link>
            )
          ) : (
            titleText
          )}
          {/* Outbound cue on a card with no case study of its own. The title
              beside it is the announced link to the same place, so this is
              hidden from the a11y tree and the tab order rather than repeating
              it. */}
          {titleIsExternal && (
            <a
              href={titleHref}
              target="_blank"
              rel="noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              className="shrink-0 self-center text-muted transition-colors duration-200 hover:text-text"
            >
              <svg
                viewBox="0 0 256 256"
                fill="currentColor"
                aria-hidden="true"
                className="h-[18px] w-[18px]"
              >
                <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
              </svg>
            </a>
          )}
        </h3>
        <span className="flex shrink-0 flex-wrap items-baseline gap-1.5">
          {(Array.isArray(project.discipline)
            ? project.discipline
            : project.discipline
              ? [project.discipline]
              : []
          ).map((d) => (
            <span
              key={d}
              className="project-discipline rounded-[3px] px-2 py-1 font-body text-[13px] leading-[17px]"
            >
              {d}
            </span>
          ))}
          {/* A repo card carries the GitHub mark here, beside any discipline. */}
          {project.repoHref && (
            <a
              href={project.repoHref}
              target="_blank"
              rel="noreferrer"
              data-cursor-label="GitHub"
              aria-label={`${project.name} on GitHub`}
              className="project-discipline flex items-center rounded-[3px] px-2 py-1 transition-colors duration-200 hover:text-text"
            >
              <GitHubMark />
            </a>
          )}
        </span>
      </div>
      {project.description && (
        <p className="mt-2 font-body text-[16px] leading-6 text-muted">
          {project.description}
        </p>
      )}
    </div>
  );

  // No case study of its own. The artwork, the title and the arrow all land on
  // the live build (or the repo, for a project that's only a repo) — the
  // artwork out of the tab order and the a11y tree so the card announces once,
  // as the titled link. The GitHub mark in the label slot is its own link.
  if (!project.href) {
    return (
      <div ref={cardRef} className="group/card block">
        {titleIsExternal ? (
          <a
            href={titleHref}
            target="_blank"
            rel="noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            className="block"
          >
            {visual}
          </a>
        ) : (
          visual
        )}
        {meta(true)}
      </div>
    );
  }

  // A card that links to a case study *and* carries a GitHub mark can't wrap
  // its meta block in a <Link>, since the mark is a link itself and links
  // can't nest. The title carries the link instead, and the artwork keeps its
  // own — taken out of the tab order and the a11y tree so the card still
  // announces as one link, the titled one, rather than two identical ones.
  if (project.repoHref) {
    return (
      <div ref={cardRef} className="group/card">
        <Link href={project.href} tabIndex={-1} aria-hidden="true" className="block">
          {visual}
        </Link>
        {meta(true)}
      </div>
    );
  }

  return (
    <div ref={cardRef}>
      <Link href={project.href} className="group/card block">
        {visual}
        {meta(false)}
      </Link>
    </div>
  );
}
