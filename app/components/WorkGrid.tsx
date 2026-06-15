"use client";

import { useMemo, useState } from "react";
import { ProjectCard, type Project } from "./ProjectCard";

/**
 * Client-side filter layer for the /work grid. Renders a small row of status
 * chips above the cards: all / cooking (in progress) / shipped (live) / on the
 * way (not started). The visible order is whatever's in the source array - the
 * page.tsx sequence is intentional (not date-sorted), so this component
 * preserves it on every filter.
 *
 * Kept separate from app/work/page.tsx so the page itself stays a server
 * component and the project array doesn't have to ship as a client bundle from
 * any deeper than this.
 */

const ALL = "all";

// Status chips, in display order: shipped first (the default view), then
// in-progress work, with "all" last. `key` matches Project["status"]; `label`
// is the playful copy that renders (uppercased via CSS). A status chip only
// shows if at least one project carries that status.
const STATUS_CHIPS: { key: Project["status"]; label: string }[] = [
  { key: "built", label: "shipped" },
  { key: "building", label: "cooking" },
  { key: "soon", label: "on the way" },
];

export function WorkGrid({ projects }: { projects: Project[] }) {
  // Each status that actually appears (in STATUS_CHIPS order) + "all" at the end.
  const chips = useMemo(() => {
    const present = new Set(projects.map((p) => p.status));
    const statusChips = STATUS_CHIPS.filter((c) => present.has(c.key));
    return [...statusChips, { key: ALL, label: ALL }];
  }, [projects]);

  // Default to "shipped" — the grid opens on finished work, not everything.
  const [active, setActive] = useState<string>("built");

  const visible = useMemo(
    () =>
      projects.filter((p) => (active === ALL ? true : p.status === active)),
    [projects, active],
  );

  return (
    // MOCKUP — Emma Wu / emmiwu.com style: wider page bleed, tighter gutters,
    // 2-col at md+, max-w-[1700px]. Revert: restore px-10 + md:w-4/5 + gap-x-8.
    <section className="px-[27px] pb-10 sm:px-6">
      {/* filter chips */}
      <nav
        aria-label="Filter projects by status"
        className="mx-auto mb-12 flex max-w-4xl flex-wrap items-center justify-center gap-2"
      >
        {chips.map((chip) => {
          const isActive = chip.key === active;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setActive(chip.key)}
              aria-pressed={isActive}
              data-cursor-label={isActive ? undefined : chip.label}
              className={
                isActive
                  ? "rounded-full bg-text px-3.5 py-1.5 font-mono text-caption-1 uppercase tracking-wide text-bg transition-colors"
                  : "rounded-full border border-border px-3.5 py-1.5 font-mono text-caption-1 uppercase tracking-wide text-text/55 transition-colors hover:border-text/40 hover:text-text"
              }
            >
              {chip.label}
            </button>
          );
        })}
      </nav>

      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2">
        {visible.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>
    </section>
  );
}
